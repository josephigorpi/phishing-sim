// === frontend/src/services/api.js ===
import axios from 'axios';

/**
 * Instancia central de axios.
 * - baseURL desde VITE_API_URL
 * - interceptor para normalizar errores (el backend responde { success, data, message })
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.message;
    const status = error?.response?.status;
    const message =
      backendMessage ||
      (status ? `Error ${status} al comunicarse con el servidor` : 'No se pudo conectar con el servidor');
    return Promise.reject(new Error(message));
  }
);

export default api;
