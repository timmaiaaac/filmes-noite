/**
 * Gera src/data/category-awards.json a partir da planilha de filmes do Oscar,
 * no MESMO formato que GET /api/category-awards devolve (ver
 * backend/services/categoryAwards.service.js).
 *
 * Serve para o front mostrar os vencedores sem o backend no ar
 * (VITE_DATA_SOURCE=planilha no frontend/.env).
 *
 * Mapeamento do CSV, igual ao do banco (docs/database.md):
 *   CanonicalCategory → categoryName   Class    → categoryClass
 *   Category          → categoryLabel  Ceremony → ceremony.id, Year → ceremony.year
 *   Film / FilmId / Detail (separados por "|") → films[]
 *   Nominees / NomineeIds (separados por "|")  → nominees[]
 *   Winner === "True" → entra na lista de vencedores
 *
 * Os ids de categoria, filme, pessoa e indicação são gerados aqui, na ordem
 * da planilha — não são os mesmos ids do banco.
 *
 * Uso (a partir de frontend/):
 *   node scripts/build-awards-from-csv.js [caminho/do/filmes.csv]
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = process.argv[2] ?? path.join(homedir(), "Downloads", "filmes.csv");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "category-awards.json");

const split = (value) => (value ? value.split("|").map((part) => part.trim()) : []);
const orNull = (value) => (value ? value : null);

/** Dá um id estável para cada chave única, na ordem em que aparece. */
function idRegistry() {
  const ids = new Map();
  return (key) => {
    if (!ids.has(key)) ids.set(key, ids.size + 1);
    return ids.get(key);
  };
}

async function main() {
  const [headerLine, ...lines] = (await readFile(CSV_PATH, "utf8")).split(/\r?\n/);
  const header = headerLine.split("\t");
  const col = (name) => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`Coluna ${name} não encontrada em ${CSV_PATH}`);
    return index;
  };
  const C = Object.fromEntries(
    ["Ceremony", "Year", "Class", "CanonicalCategory", "Category", "Film", "FilmId",
      "Nominees", "NomineeIds", "Winner", "Detail", "Note", "Citation"].map((name) => [name, col(name)])
  );

  const categoryId = idRegistry();
  const filmId = idRegistry();
  const personId = idRegistry();
  const categories = new Map();
  let nominationId = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const row = line.split("\t");
    const cell = (name) => (row[C[name]] ?? "").trim();

    nominationId++;
    const name = cell("CanonicalCategory");

    // Toda categoria entra, mesmo sem vencedores — como no backend.
    if (!categories.has(name)) {
      categories.set(name, {
        categoryId: categoryId(name),
        categoryName: name,
        categoryClass: cell("Class"),
        winsCount: 0,
        winners: [],
      });
    }

    if (cell("Winner") !== "True") continue;

    const titles = split(cell("Film"));
    const filmImdbIds = split(cell("FilmId"));
    const details = split(cell("Detail"));
    const people = split(cell("Nominees"));
    const personImdbIds = split(cell("NomineeIds"));

    const category = categories.get(name);
    category.winners.push({
      nominationId,
      categoryLabel: cell("Category"),
      note: orNull(cell("Note")),
      citation: orNull(cell("Citation")),
      ceremony: { id: Number(cell("Ceremony")), year: cell("Year") },
      films: titles.map((title, i) => {
        const imdbId = orNull(filmImdbIds[i]);
        return { id: filmId(imdbId ?? `title:${title}`), imdbId, title, detail: orNull(details[i]) };
      }),
      nominees: people.map((personName, i) => {
        const imdbId = orNull(personImdbIds[i]);
        return { id: personId(imdbId ?? `name:${personName}`), imdbId, name: personName };
      }),
    });
    category.winsCount++;
  }

  // Mesma ordem do backend: categorias por nome, vencedores por id.
  const data = [...categories.values()].sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(data) + "\n");

  const wins = data.reduce((sum, category) => sum + category.winsCount, 0);
  console.log(`Salvo em ${path.relative(ROOT, OUTPUT_PATH)}: ${data.length} categorias, ${wins} vencedores.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
