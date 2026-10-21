// === backend/services/langflowService.js ===
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpResponse.js';

const DIFFICULTY_MAP = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

/**
 * Solicita a LangFlow una plantilla adaptada al perfil del usuario.
 * Si LANGFLOW_WEBHOOK_URL no está configurada, hace fallback (retorna null)
 * para que el caller use una plantilla de BD y no se rompa el flujo.
 */
export async function requestAdaptedTemplate({ user, department, lastResults = [] }) {
  const payload = {
    user: {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      difficulty_level: user.difficulty_level,
      risk_score: user.risk_score,
    },
    department: department || null,
    last_results: lastResults,
    target_difficulty: DIFFICULTY_MAP[user.difficulty_level] || 'easy',
    requested_at: new Date().toISOString(),
  };

  if (!env.langflowWebhookUrl) {
    // TODO: Configurar LANGFLOW_WEBHOOK_URL cuando el flujo real esté listo.
    // Placeholder funcional: devolver null para que el orquestador use fallback.
    console.warn(
      '[langflowService] LANGFLOW_WEBHOOK_URL no configurada. Se usará plantilla de BD como fallback.'
    );
    return null;
  }

  try {
    const res = await fetch(env.langflowWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': env.langflowWebhookSecret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new HttpError(`LangFlow respondió ${res.status}`, 502);
    const data = await res.json();
    // Estructura esperada: { name, subject, body_html, category, difficulty_level }
    if (!data || !data.subject || !data.body_html) {
      throw new HttpError('LangFlow devolvió una plantilla inválida', 502);
    }
    return data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(`Error llamando a LangFlow: ${err.message}`, 502);
  }
}
