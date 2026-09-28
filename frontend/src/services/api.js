/**
 * Cliente da API do backend.
 *
 * Em desenvolvimento o Vite faz proxy de /api para http://localhost:3000
 * (ver vite.config.js), então as chamadas usam caminho relativo.
 *
 * VITE_DATA_SOURCE no frontend/.env escolhe de onde vêm os dados:
 *   "api" (padrão) → backend em /api
 *   "planilha"     → src/data/category-awards.json, gerado da planilha por
 *                    scripts/build-awards-from-csv.js no mesmo formato da API
 */
const BASE_URL = "/api";
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === "planilha" ? "planilha" : "api";

async function request(path) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    // Rede indisponível ou proxy sem destino.
    throw new Error("Não foi possível alcançar a API.");
  }

  // Quando o backend está fora, o proxy responde 500 com corpo vazio ou HTML,
  // e o parse falha — daí a leitura protegida em vez de confiar no JSON.
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message ?? `A API respondeu com status ${response.status}.`);
  }

  if (!body) {
    throw new Error("A API respondeu sem um corpo JSON válido.");
  }

  if (body.success === false) {
    throw new Error(body.message ?? `Falha na requisição para ${path}.`);
  }

  return body;
}

/**
 * GET /api/category-awards — premiações ganhas agrupadas por categoria.
 *
 * @returns {Promise<Array<{
 *   categoryId: number,
 *   categoryName: string,
 *   categoryClass: string,
 *   winsCount: number,
 *   winners: Array<object>
 * }>>}
 */
export async function getCategoryAwards() {
  if (DATA_SOURCE === "planilha") {
    // Import dinâmico: o JSON (~1,3 MB) só é baixado quando este modo está ligado.
    const { default: data } = await import("../data/category-awards.json");
    return data;
  }

  const { data } = await request("/category-awards");
  return data ?? [];
}
