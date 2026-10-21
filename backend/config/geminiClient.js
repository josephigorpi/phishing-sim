// === backend/config/geminiClient.js ===
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

/**
 * Cliente singleton de Google Gemini.
 * La API key se lee SIEMPRE desde env (nunca se hardcodea).
 */
let genAI = null;

/**
 * Devuelve el modelo Gemini listo para usar.
 * - Retorna null si GEMINI_API_KEY no está configurada (para permitir fallback
 *   controlado en capas superiores sin romper el arranque).
 * - Acepta `overrides` para, por ejemplo, forzar `responseMimeType: 'application/json'`.
 */
export function getGeminiModel(overrides = {}) {
  if (!env.geminiApiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // disponible en tier gratuito
    ...overrides,
  });
}
