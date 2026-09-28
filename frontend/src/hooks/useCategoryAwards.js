import { useCallback, useEffect, useState } from "react";
import { getCategoryAwards } from "../services/api.js";

/**
 * Carrega GET /api/category-awards.
 *
 * Expõe `reload` para a tela oferecer "tentar novamente" quando o backend
 * estiver fora do ar.
 */
export function useCategoryAwards() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCategories(await getCategoryAwards());
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
