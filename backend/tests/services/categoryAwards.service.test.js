import { test } from "node:test";
import assert from "node:assert/strict";

function buildCategoryRow({ nominations = [] } = {}) {
    return {
        get({ plain }) {
            assert.equal(plain, true);
            return {
                id: 1,
                name: "BEST PICTURE",
                class: "Title",
                nominations
            };
        }
    };
}

async function loadServiceWithMockedFindAll(t, findAllImpl) {
    t.mock.module("../../models/relationships.js", {
        exports: {
            Category: { findAll: findAllImpl },
            Nomination: {},
            Film: {},
            Person: {},
            Ceremony: {}
        }
    });

    return import(
        `../../services/categoryAwards.service.js?update=${Date.now()}-${Math.random()}`
    );
}

test("getWinsByCategory retorna categorias com vencedores mapeados corretamente", async (t) => {
    const nomination = {
        id: 10,
        category_label: "Best Picture",
        note: null,
        citation: null,
        ceremony: { id: 96, year: "2023" },
        films: [
            {
                id: 5,
                imdb_id: "tt15398776",
                title: "Oppenheimer",
                NominationFilm: { detail: null }
            }
        ],
        nominees: [{ id: 3, imdb_id: "nm0000229", name: "Christopher Nolan" }]
    };

    const { getWinsByCategory } = await loadServiceWithMockedFindAll(
        t,
        async () => [buildCategoryRow({ nominations: [nomination] })]
    );

    const result = await getWinsByCategory(96);

    assert.equal(result.length, 1);
    const [category] = result;
    assert.deepEqual(category, {
        categoryId: 1,
        categoryName: "BEST PICTURE",
        categoryClass: "Title",
        winsCount: 1,
        winners: [
            {
                nominationId: 10,
                categoryLabel: "Best Picture",
                note: null,
                citation: null,
                ceremony: { id: 96, year: "2023" },
                films: [
                    {
                        id: 5,
                        imdbId: "tt15398776",
                        title: "Oppenheimer",
                        detail: null
                    }
                ],
                nominees: [{ id: 3, imdbId: "nm0000229", name: "Christopher Nolan" }]
            }
        ]
    });
});

test("getWinsByCategory retorna winsCount 0 e winners vazio quando a categoria não tem vencedores", async (t) => {
    const { getWinsByCategory } = await loadServiceWithMockedFindAll(
        t,
        async () => [buildCategoryRow({ nominations: [] })]
    );

    const result = await getWinsByCategory(96);

    assert.equal(result.length, 1);
    assert.equal(result[0].winsCount, 0);
    assert.deepEqual(result[0].winners, []);
});

test("getWinsByCategory lança Error com mensagem clara quando a consulta falha", async (t) => {
    const { getWinsByCategory } = await loadServiceWithMockedFindAll(t, async () => {
        throw new Error("connection refused");
    });

    await assert.rejects(
        () => getWinsByCategory(96),
        (err) => {
            assert.ok(err instanceof Error);
            assert.match(err.message, /Falha ao obter premiações ganhas por categoria/);
            assert.match(err.message, /connection refused/);
            return true;
        }
    );
});

test("getWinsByCategory filtra pela cerimônia e exige vencedores (required: true)", async (t) => {
    let receivedOptions;
    const { getWinsByCategory } = await loadServiceWithMockedFindAll(t, async (options) => {
        receivedOptions = options;
        return [];
    });

    await getWinsByCategory(96);

    const nominationInclude = receivedOptions.include[0];
    assert.deepEqual(nominationInclude.where, { winner: true, ceremony_id: 96 });
    assert.equal(nominationInclude.required, true);
});

test("getWinsByCategory aceita ceremonyId como string numérica", async (t) => {
    let receivedOptions;
    const { getWinsByCategory } = await loadServiceWithMockedFindAll(t, async (options) => {
        receivedOptions = options;
        return [];
    });

    await getWinsByCategory("96");

    assert.equal(receivedOptions.include[0].where.ceremony_id, 96);
});

for (const invalid of [undefined, null, "", "abc", 0, -1, 2.5]) {
    test(`getWinsByCategory rejeita ceremonyId inválido (${JSON.stringify(invalid)}) sem consultar o banco`, async (t) => {
        let called = false;
        const { getWinsByCategory } = await loadServiceWithMockedFindAll(t, async () => {
            called = true;
            return [];
        });

        await assert.rejects(() => getWinsByCategory(invalid), /ceremonyId inválido/);
        assert.equal(called, false);
    });
}
