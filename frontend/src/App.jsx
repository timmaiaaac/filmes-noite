import { useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import StatsRibbon from "./components/StatsRibbon.jsx";
import WinnersCatalog from "./components/WinnersCatalog.jsx";
import { useCategoryAwards } from "./hooks/useCategoryAwards.js";

/** Contagens derivadas do payload da API — nenhum valor fixo no código. */
function buildStats(categories) {
  const ceremonies = new Set();
  const films = new Set();
  let wins = 0;

  for (const category of categories) {
    wins += category.winsCount;

    for (const winner of category.winners) {
      if (winner.ceremony) ceremonies.add(winner.ceremony.id);
      for (const film of winner.films) films.add(film.id);
    }
  }

  return {
    categories: categories.length,
    wins,
    ceremonies: ceremonies.size,
    films: films.size,
  };
}

export default function App() {
  const { categories, loading, error, reload } = useCategoryAwards();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const stats = useMemo(() => buildStats(categories), [categories]);

  // Antes da primeira escolha do usuário, mostra a primeira categoria da API.
  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.categoryId === selectedCategoryId) ??
      categories[0] ??
      null,
    [categories, selectedCategoryId]
  );

  return (
    <>
      <Header />

      <Sidebar
        categories={categories}
        loading={loading}
        error={error}
        selectedCategoryId={selectedCategory?.categoryId ?? null}
        onSelectCategory={setSelectedCategoryId}
      />

      <div className="pl-72">
        <main className="w-full min-h-[calc(100vh-5rem)] pt-20 px-gutter bg-surface">
          <div className="flex flex-col w-full">
            <StatsRibbon stats={stats} loading={loading} error={error} />
            <WinnersCatalog
              category={selectedCategory}
              loading={loading}
              error={error}
              onReload={reload}
            />
          </div>
        </main>
      </div>
    </>
  );
}
