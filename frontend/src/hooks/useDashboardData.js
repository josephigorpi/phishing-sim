// === frontend/src/hooks/useDashboardData.js ===
import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '../services/reportService';

/**
 * Hook de métricas del dashboard.
 * @param {number|string|undefined|null} departmentId
 *   - undefined => métricas globales
 *   - string/number => métricas de un área
 *   - null => no ejecuta el fetch (útil cuando esperamos selección)
 */
export function useDashboardData(departmentId) {
  const shouldFetch = departmentId !== null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!shouldFetch) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard(departmentId);
      setData(result || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [departmentId, shouldFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
