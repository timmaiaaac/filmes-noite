/**
 * Service de premiações por categoria.
 *
 * Responsabilidade: aplicar a regra de negócio "contar premiações ganhas
 * por cada categoria" e devolver dados estruturados dos ganhadores,
 * prontos para um controller consumir.
 *
 * Critério de vitória: Nomination.winner === true.
 * Agrupamento: Category (id, name, class).
 *
 * Estratégia de erro: lança Error com mensagem clara em falhas de consulta
 * ou mapeamento. O controller futuro deve capturar e traduzir em HTTP.
 */

import {
    Category,
    Nomination,
    Film,
    Person,
    Ceremony
  } from '../models/relationships.js';
  
  /**
   * Conta premiações ganhas por categoria e retorna os ganhadores agrupados.
   *
   * @returns {Promise<Array<{
   *   categoryId: number,
   *   categoryName: string,
   *   categoryClass: string,
   *   winsCount: number,
   *   winners: Array<{
   *     nominationId: number,
   *     categoryLabel: string,
   *     note: string|null,
   *     citation: string|null,
   *     ceremony: { id: number, year: string }|null,
   *     films: Array<{ id: number, imdbId: string|null, title: string, detail: string|null }>,
   *     nominees: Array<{ id: number, imdbId: string|null, name: string }>
   *   }>
   * }>>}
   *
   * @throws {Error} Quando a consulta ao banco ou o mapeamento falha.
   *
   * @example
   * // Exemplo de um item do array retornado:
   * // {
   * //   categoryId: 1,
   * //   categoryName: 'BEST PICTURE',
   * //   categoryClass: 'Title',
   * //   winsCount: 2,
   * //   winners: [
   * //     {
   * //       nominationId: 10,
   * //       categoryLabel: 'Best Picture',
   * //       note: null,
   * //       citation: null,
   * //       ceremony: { id: 96, year: '2023' },
   * //       films: [{ id: 5, imdbId: 'tt15398776', title: 'Oppenheimer', detail: null }],
   * //       nominees: [{ id: 3, imdbId: 'nm0000229', name: 'Christopher Nolan' }]
   * //     }
   * //   ]
   * // }
   */
  export async function getWinsByCategory() {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'class'],
        include: [
          {
            model: Nomination,
            as: 'nominations',
            required: false,
            where: { winner: true },
            attributes: ['id', 'category_label', 'note', 'citation'],
            include: [
              {
                model: Ceremony,
                as: 'ceremony',
                attributes: ['id', 'year']
              },
              {
                model: Film,
                as: 'films',
                attributes: ['id', 'imdb_id', 'title'],
                through: { attributes: ['detail'] }
              },
              {
                model: Person,
                as: 'nominees',
                attributes: ['id', 'imdb_id', 'name'],
                through: { attributes: [] }
              }
            ]
          }
        ],
        order: [
          ['name', 'ASC'],
          [{ model: Nomination, as: 'nominations' }, 'id', 'ASC']
        ]
      });
  
      return categories.map((category) => {
        const plain = category.get({ plain: true });
        const winners = (plain.nominations ?? []).map((nomination) => ({
          nominationId: nomination.id,
          categoryLabel: nomination.category_label,
          note: nomination.note,
          citation: nomination.citation,
          ceremony: nomination.ceremony
            ? {
                id: nomination.ceremony.id,
                year: nomination.ceremony.year
              }
            : null,
          films: (nomination.films ?? []).map((film) => ({
            id: film.id,
            imdbId: film.imdb_id,
            title: film.title,
            detail: film.NominationFilm?.detail ?? null
          })),
          nominees: (nomination.nominees ?? []).map((person) => ({
            id: person.id,
            imdbId: person.imdb_id,
            name: person.name
          }))
        }));
  
        return {
          categoryId: plain.id,
          categoryName: plain.name,
          categoryClass: plain.class,
          winsCount: winners.length,
          winners
        };
      });
    } catch (error) {
      throw new Error(
        `Falha ao obter premiações ganhas por categoria: ${error.message}`
      );
    }
  }