import MaterialIcon from "./MaterialIcon.jsx";
import WinnerCard from "./WinnerCard.jsx";
import { hasPosterProvider } from "../services/posters.js";
import { formatCategoryName } from "../utils/format.js";

function StateMessage({ icon, title, description, action }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center text-center gap-space-sm shadow-lg">
      <MaterialIcon name={icon} className="text-[40px] text-secondary" />
      <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl animate-pulse">
      <div className="w-full h-80 bg-surface-container" />
      <div className="p-space-lg flex flex-col gap-space-sm">
        <div className="h-6 w-2/3 bg-surface-container rounded" />
        <div className="h-4 w-1/2 bg-surface-container rounded" />
      </div>
    </div>
  );
}

/** Vencedores da categoria selecionada. */
export default function WinnersCatalog({ category, loading, error, onReload }) {
  const winners = category?.winners ?? [];

  return (
    <section className="max-w-7xl mx-auto w-full pb-space-2xl flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-1">
            Vencedores
          </span>
          <h2 className="font-headline-xl text-headline-xl text-primary">
            {category ? formatCategoryName(category.categoryName) : "—"}
          </h2>
          {category?.categoryClass && (
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mt-1">
              Classe: {category.categoryClass}
            </span>
          )}
        </div>

        {category && (
          <span className="px-space-md py-1.5 rounded-lg font-label-sm text-label-sm uppercase tracking-wider bg-primary-container text-on-primary-container font-bold self-start md:self-auto">
            {category.winsCount} {category.winsCount === 1 ? "vitória" : "vitórias"}
          </span>
        )}
      </div>

      {!hasPosterProvider && (
        <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-3 rounded-lg text-on-surface-variant">
          <MaterialIcon name="info" className="text-secondary text-[20px]" />
          <span className="font-body-sm text-body-sm">
            Defina <code className="text-secondary">VITE_TMDB_API_KEY</code> em{" "}
            <code className="text-secondary">frontend/.env</code> para carregar os pôsteres.
          </span>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {Array.from({ length: 6 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && error && (
        <StateMessage
          icon="cloud_off"
          title="Não foi possível carregar os dados"
          description={`${error} — confirme se o backend está rodando em http://localhost:3000.`}
          action={
            <button
              type="button"
              onClick={onReload}
              className="flex items-center gap-space-xs bg-primary-container text-on-primary-container px-space-lg py-2.5 rounded-lg font-label-sm text-label-sm uppercase tracking-wider font-bold hover:bg-secondary-fixed transition-colors"
            >
              <MaterialIcon name="refresh" className="text-[18px]" />
              Tentar novamente
            </button>
          }
        />
      )}

      {!loading && !error && winners.length === 0 && (
        <StateMessage
          icon="search_off"
          title="Nenhuma vitória registrada"
          description="Esta categoria não tem premiações com vencedor no banco."
        />
      )}

      {!loading && !error && winners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {winners.map((winner) => (
            <WinnerCard key={winner.nominationId} winner={winner} />
          ))}
        </div>
      )}
    </section>
  );
}
