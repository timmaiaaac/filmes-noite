/**
 * Gera src/data/posters.json a partir da planilha de filmes do Oscar.
 *
 * Lê o CSV (separado por tab) com a coluna FilmId — os imdb_id que foram
 * carregados no banco —, consulta o TMDB para cada filme e salva um mapa
 * { "tt0019217": "https://image.tmdb.org/t/p/w500/....jpg" | null }.
 * `null` significa que o TMDB não tem pôster para aquele filme.
 *
 * Uso (a partir de frontend/):
 *   node scripts/fetch-posters.js [caminho/do/filmes.csv]
 *
 * A chave vem de VITE_TMDB_API_KEY no frontend/.env. Rodar de novo reaproveita
 * o JSON existente e só consulta os filmes que ainda faltam.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = process.argv[2] ?? path.join(homedir(), "Downloads", "filmes.csv");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "posters.json");

const TMDB_FIND_URL = "https://api.themoviedb.org/3/find";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const CONCURRENCY = 10;
const MAX_ATTEMPTS = 4;

async function readApiKey() {
  const envFile = await readFile(path.join(ROOT, ".env"), "utf8");
  const line = envFile.split(/\r?\n/).find((l) => l.startsWith("VITE_TMDB_API_KEY="));
  const key = line?.slice("VITE_TMDB_API_KEY=".length).trim().replace(/^["']|["']$/g, "");

  if (!key) throw new Error("VITE_TMDB_API_KEY não definida em frontend/.env");
  return key;
}

/** Extrai os imdb_id únicos da coluna FilmId (vários filmes vêm separados por "|"). */
async function readFilmIds(csvPath) {
  const [header, ...rows] = (await readFile(csvPath, "utf8")).split(/\r?\n/);
  const filmIdCol = header.split("\t").indexOf("FilmId");

  if (filmIdCol === -1) throw new Error(`Coluna FilmId não encontrada em ${csvPath}`);

  const ids = new Set();
  for (const row of rows) {
    const cell = row.split("\t")[filmIdCol] ?? "";
    for (const id of cell.split("|")) {
      if (/^tt\d+$/.test(id.trim())) ids.add(id.trim());
    }
  }
  return [...ids];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPoster(imdbId, apiKey) {
  const url = `${TMDB_FIND_URL}/${imdbId}?external_source=imdb_id&language=pt-BR&api_key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429 || response.status >= 500) {
        // Limite de requisições ou instabilidade: espera e tenta de novo.
        const retryAfter = Number(response.headers.get("retry-after")) || attempt * 2;
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) throw new Error(`status ${response.status}`);

      const body = await response.json();
      const posterPath = body.movie_results?.[0]?.poster_path;
      return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      await sleep(attempt * 1000);
    }
  }

  throw new Error("tentativas esgotadas");
}

async function main() {
  const apiKey = await readApiKey();
  const ids = await readFilmIds(CSV_PATH);

  const posters = existsSync(OUTPUT_PATH)
    ? JSON.parse(await readFile(OUTPUT_PATH, "utf8"))
    : {};
  const pending = ids.filter((id) => !(id in posters));

  console.log(`${ids.length} filmes na planilha, ${pending.length} a consultar no TMDB.`);

  const failed = [];
  let done = 0;
  let next = 0;

  async function worker() {
    while (next < pending.length) {
      const id = pending[next++];
      try {
        posters[id] = await fetchPoster(id, apiKey);
      } catch (err) {
        failed.push(id);
        console.error(`\nFalha em ${id}: ${err.message}`);
      }
      done++;
      if (done % 100 === 0 || done === pending.length) {
        process.stdout.write(`\r${done}/${pending.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Ordena as chaves para o arquivo ficar estável entre execuções.
  const sorted = Object.fromEntries(Object.entries(posters).sort(([a], [b]) => a.localeCompare(b)));
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + "\n");

  const withPoster = Object.values(sorted).filter(Boolean).length;
  console.log(`\nSalvo em ${path.relative(ROOT, OUTPUT_PATH)}: ${withPoster} com pôster, ` +
    `${Object.keys(sorted).length - withPoster} sem pôster, ${failed.length} falhas.`);
  if (failed.length) console.log("Rode de novo para tentar só as falhas.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
