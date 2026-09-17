import { test } from "node:test";
import assert from "node:assert/strict";

function buildRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
    return res;
}

async function loadControllerWithMockedService(t, getWinsByCategoryImpl) {
    t.mock.module("../../services/categoryAwards.service.js", {
        exports: { getWinsByCategory: getWinsByCategoryImpl }
    });

    return import(
        `../../controllers/categoryAwards.controller.js?update=${Date.now()}-${Math.random()}`
    );
}

test("getWinsByCategory (controller) responde 200 com os dados do service", async (t) => {
    const fakeData = [{ categoryId: 1, categoryName: "BEST PICTURE", winsCount: 1, winners: [] }];
    const { getWinsByCategory } = await loadControllerWithMockedService(
        t,
        async () => fakeData
    );

    const res = buildRes();
    await getWinsByCategory({}, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
        success: true,
        total: fakeData.length,
        data: fakeData
    });
});

test("getWinsByCategory (controller) responde 500 quando o service lança Error", async (t) => {
    const { getWinsByCategory } = await loadControllerWithMockedService(t, async () => {
        throw new Error("Falha ao obter premiações ganhas por categoria: db down");
    });

    const res = buildRes();
    await getWinsByCategory({}, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /db down/);
});
