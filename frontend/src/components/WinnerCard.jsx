import MaterialIcon from "./MaterialIcon.jsx";
import { usePoster } from "../hooks/usePoster.js";

/**
 * Cartão de uma premiação vencedora.
 *
 * Exibe somente campos que vêm de GET /api/category-awards:
 * `ceremony.year`, `categoryLabel`, `films[].title`, `films[].detail`,
 * `nominees[].name`, `citation` e `note`. O pôster é resolvido pelo
 * `films[].imdbId` no TMDB, já que o banco não guarda imagem.
 */
export default function WinnerCard({ winner }) {
  const [mainFilm, ...otherFilms] = winner.films;
  const posterUrl = usePoster(mainFilm?.imdbId);

  const peopleNames = winner.nominees.map((person) => person.name);
  const title = mainFilm?.title ?? peopleNames[0] ?? winner.categoryLabel;
  const imdbUrl = mainFilm?.imdbId ? `https://www.imdb.com/title/${mainFilm.imdbId}/` : null;

  return (
    <article className="group bg-surface-container-low rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
      <div className="relative w-full h-80 overflow-hidden bg-surface-container">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`Pôster de ${title}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-space-sm text-outline">
            <MaterialIcon name="theaters" className="text-[44px]" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest px-space-md text-center">
              Sem pôster
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />

        {winner.ceremony && (
          <div className="absolute top-space-sm left-space-sm flex items-center gap-1.5 bg-surface-container-lowest/85 backdrop-blur-md px-2.5 py-1 rounded-full text-secondary shadow-md">
            <MaterialIcon name="event" className="text-[16px]" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
              {winner.ceremony.year}
            </span>
          </div>
        )}

        <div className="absolute bottom-space-md left-space-md right-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-widest bg-secondary-container text-primary font-bold px-2.5 py-1 rounded">
            {winner.categoryLabel}
          </span>
        </div>
      </div>

      <div className="p-space-lg flex-1 flex flex-col justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>

          {mainFilm?.detail && (
            <span className="font-body-sm text-body-sm text-secondary italic">
              {mainFilm.detail}
            </span>
          )}

          {mainFilm && peopleNames.length > 0 && (
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              {peopleNames.join(" • ")}
            </span>
          )}

          {otherFilms.length > 0 && (
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Também premiado em: {otherFilms.map((film) => film.title).join(", ")}
            </span>
          )}

          {winner.citation && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {winner.citation}
            </p>
          )}

          {winner.note && (
            <p className="font-body-sm text-body-sm text-outline mt-1">{winner.note}</p>
          )}
        </div>

        {imdbUrl && (
          <a
            href={imdbUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 bg-surface-container-high hover:bg-secondary hover:text-on-secondary py-2.5 rounded font-label-sm text-label-sm uppercase tracking-wider font-bold text-primary transition-colors"
          >
            <MaterialIcon name="open_in_new" className="text-[16px]" />
            Ver no IMDb
          </a>
        )}
      </div>
    </article>
  );
}
