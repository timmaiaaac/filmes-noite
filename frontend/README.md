# Frontend — Premiações da Academia

Interface em React (Vite) do projeto *filmes-noite*, consumindo a API do backend.

O visual foi derivado de um protótipo em HTML (`code.html`, gerado no Stitch), mas
**todo o conteúdo fictício do protótipo foi removido**: a tela exibe apenas dados
que a API realmente retorna.

## Stack

- **React 19** + **Vite 6**
- **Tailwind CSS 3** com o tema do protótipo portado em `tailwind.config.js`
- JavaScript puro (sem TypeScript), acompanhando o backend

## Como rodar

O front depende do backend, então suba os dois.

```bash
# 1. backend (em outro terminal, a partir da raiz do repositório)
cd backend
npm install
# crie backend/.env com DATABASE_URL=postgres://...
npm run dev          # http://localhost:3000

# 2. frontend
cd frontend
npm install
cp .env.example .env # opcional: preencha VITE_TMDB_API_KEY
npm run dev          # http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:3000` (ver `vite.config.js`).

### Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `VITE_TMDB_API_KEY` | não | Busca os pôsteres no TMDB pelo `imdb_id`. Sem ela, os cards mostram "Sem pôster" e o resto funciona normalmente. |

Crie a chave em <https://www.themoviedb.org/settings/api> (opção *API Key (v3 auth)*).

> Tudo que começa com `VITE_` é embutido no bundle e fica visível no navegador.
> Para a chave de leitura do TMDB isso é aceitável; uma chave sensível deveria
> ser usada apenas pelo backend.

## Integração com o backend

O backend expõe hoje **uma única rota**, e o front consome exatamente ela:

| Rota | Uso no front |
| --- | --- |
| `GET /api/category-awards` | Alimenta a **sidebar de categorias**, a **faixa de contagens** e o **catálogo de vencedores** da categoria selecionada. |

O cliente HTTP fica em `src/services/api.js`. **Nenhuma alteração foi feita no backend.**

### O que é exibido, campo por campo

Tudo que aparece na tela vem do payload dessa rota:

| Na tela | Campo da API |
| --- | --- |
| Categorias da sidebar | `categoryName` |
| Selo ao lado da categoria | `winsCount` |
| Classe da categoria | `categoryClass` |
| Ano no cartão | `winners[].ceremony.year` |
| Selo dourado no cartão | `winners[].categoryLabel` |
| Título do cartão | `winners[].films[].title` (ou `nominees[].name` quando não há filme) |
| Personagem / obra | `winners[].films[].detail` |
| Nomes premiados | `winners[].nominees[].name` |
| Citação e nota | `winners[].citation`, `winners[].note` |
| Link do IMDb e pôster | `winners[].films[].imdbId` |

A faixa de contagens (categorias, vitórias, cerimônias, filmes) é **calculada a
partir desse mesmo payload** em `App.jsx` — não há números fixos no código.

### De onde vêm as imagens

A tabela `film` guarda apenas `id`, `imdb_id` e `title` — **não há coluna de pôster**.
As imagens são resolvidas no front por `src/services/posters.js`, que consulta o
endpoint `/find` do TMDB pelo `imdb_id` e faz cache em `sessionStorage`.

## Estrutura

```
src/
├── App.jsx                 # layout, categoria selecionada e contagens derivadas
├── components/
│   ├── Header.jsx          # identificação do projeto
│   ├── Sidebar.jsx         # categorias vindas da API
│   ├── StatsRibbon.jsx     # contagens calculadas do payload
│   ├── WinnersCatalog.jsx  # grid + estados de carregando/erro/vazio
│   ├── WinnerCard.jsx      # cartão de uma premiação vencedora
│   └── MaterialIcon.jsx
├── hooks/
│   ├── useCategoryAwards.js
│   └── usePoster.js
├── services/
│   ├── api.js              # cliente do backend
│   └── posters.js          # pôsteres via TMDB
└── utils/format.js         # normaliza "BEST PICTURE" → "Best Picture"
```

## Limitações conhecidas

- **Layout apenas desktop.** A sidebar é fixa (`w-72`) e o conteúdo usa `pl-72`,
  sem breakpoints — herdado do protótipo. Em telas estreitas há scroll horizontal.
- **Só a rota `/api/category-awards` existe**, então a tela cobre apenas
  premiações vencedoras. Indicados que não venceram não são retornados pela API.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
