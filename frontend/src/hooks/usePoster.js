import { useEffect, useState } from "react";
import { getPosterUrl } from "../services/posters.js";

/**
 * Resolve o pôster de um filme pelo imdbId.
 *
 * Falha silenciosamente: sem pôster o card cai no visual de fallback, o que é
 * preferível a quebrar a listagem inteira por causa de uma imagem.
 */
export function usePoster(imdbId) {
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    if (!imdbId) {
      setPosterUrl(null);
      return;
    }

    let cancelled = false;

    getPosterUrl(imdbId)
      .then((url) => {
        if (!cancelled) setPosterUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPosterUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [imdbId]);

  return posterUrl;
}
