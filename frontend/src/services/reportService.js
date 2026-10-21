// === frontend/src/services/reportService.js ===
import api from './api';

/**
 * Métricas globales o por área.
 * @param {number|string|undefined} departmentId - si se omite, devuelve métricas globales.
 */
export const getDashboard = async (departmentId) => {
  const url = departmentId
    ? `/reports/dashboard/${departmentId}`
    : '/reports/dashboard';
  const { data } = await api.get(url);
  return data.data;
};
