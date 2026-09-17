Projeto Filmes

## Services

### `getWinsByCategory()` (`services/categoryAwards.service.js`)

Retorna premiações com `Nomination.winner = true`, agrupadas por `Category`.
Cada item traz `categoryId`, `categoryName`, `categoryClass`, `winsCount` e `winners`
(com `ceremony`, `films` e `nominees`). Em erro de consulta, lança `Error` com mensagem clara.

## Testes

```
npm test
```

Roda os testes automatizados (`node --test`) do service `categoryAwards.service.js`
e do controller `categoryAwards.controller.js`, usando mocks de módulo (não é
necessário banco de dados para rodar os testes).

## Middlewares da aplicação

`app.js` aplica, nesta ordem:

1. `cors()` — libera requisições de outras origens (necessário para o frontend consumir a API).
2. `express.json()` — parse do corpo das requisições.
3. Handler de rota não encontrada — responde `404` com `{ success: false, message }`.
4. Handler de erro genérico — responde `500` com `{ success: false, message: "Erro interno inesperado." }` para erros não tratados nas rotas.