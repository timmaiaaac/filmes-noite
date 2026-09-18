/**
 * Busca de pôsteres no TMDB a partir do `imdb_id` que o backend já guarda
 * na tabela `film` (formato tt0019217).
 *
 * O banco do projeto não tem coluna de imagem, então o pôster é resolvido aqui,
 * no front, sem exigir nenhuma mudança no backend.
 *
 * Atenção: com Vite, tudo que começa com VITE_ vai para o bundle do navegador —
 * ou seja, esta chave fica visível para quem abrir o site. Para o TMDB, cuja
 * chave é apenas de leitura, isso é aceitável em um projeto de estudo. Em
 * produção o ideal seria o backend fazer essa chamada e expor o resultado.
 */
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_FIND_URL = "https://api.themoviedb.org/3/find";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const CACHE_PREFIX = "poster:";

/** Indica se a chave foi configurada, para a UI avisar em vez de falhar calada. */
export const hasPosterProvider = Boolean(TMDB_API_KEY);

/** Evita repetir a requisição do mesmo filme dentro da sessão. */
const memoryCache = new Map();

function readCache(imdbId) {
  if (memoryCache.has(imdbId)) return memoryCache.get(imdbId);

  try {
    const stored = sessionStorage.getItem(CACHE_PREFIX + imdbId);
    if (stored === null) return undefined;

    // String vazia registra "já consultei e não existe pôster".
    const value = stored || null;
    memoryCache.set(imdbId, value);
    return value;
  } catch {
    return undefined;
  }
}

function writeCache(imdbId, posterUrl) {
  memoryCache.set(imdbId, posterUrl);
  try {
    sessionStorage.setItem(CACHE_PREFIX + imdbId, posterUrl ?? "");
  } catch {
    // sessionStorage indisponível (aba anônima, cota cheia): o cache em
    // memória já resolve o essencial.
  }
}

/**
 * Resolve a URL do pôster de um filme.
 *
 * @param {string|null} imdbId Ex.: "tt15398776".
 * @returns {Promise<string|null>} URL da imagem, ou null se não houver pôster
 *   ou se a chave do TMDB não estiver configurada.
 */
export async function getPosterUrl(imdbId) {
  if (!imdbId || !TMDB_API_KEY) return null;

  const cached = readCache(imdbId);
  if (cached !== undefined) return cached;

  const url = `${TMDB_FIND_URL}/${imdbId}?external_source=imdb_id&language=pt-BR&api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB respondeu ${response.status} para ${imdbId}`);
  }

  const body = await response.json();
  const match = body.movie_results?.[0];
  const posterUrl = match?.poster_path ? `${TMDB_IMAGE_BASE}${match.poster_path}` : null;

  writeCache(imdbId, posterUrl);
  return posterUrl;
}
