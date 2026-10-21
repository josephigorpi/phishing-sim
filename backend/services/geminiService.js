// === backend/services/geminiService.js ===
import { env } from '../config/env.js';
import { getGeminiModel } from '../config/geminiClient.js';
import { HttpError } from '../utils/httpResponse.js';

/**
 * Reemplaza a langflowService.js.
 * Misma firma y mismo formato de retorno:
 *   - Éxito  -> { name, subject, body_html, category, difficulty_level }
 *   - Fallo controlado (sin API key o modelo no disponible) -> null (para fallback BD)
 *   - Fallo de API -> throw HttpError(502)
 */

const DIFFICULTY_MAP = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

const ALLOWED_CATEGORIES = [
  'credential_harvest',
  'malicious_link',
  'malicious_attachment',
  'urgency',
  'authority',
  'reward',
];

/**
 * Construye el prompt de sistema + perfil del destinatario.
 * Enfatiza el uso EDUCATIVO (awareness ISO 27001 A.6.3) y prohíbe uso malicioso.
 */
function buildPrompt({ user, department, lastResults }) {
  const difficulty = DIFFICULTY_MAP[user.difficulty_level] || 'easy';

  const historyText =
    Array.isArray(lastResults) && lastResults.length > 0
      ? JSON.stringify(lastResults.slice(0, 5), null, 2)
      : 'Sin historial previo.';

  return `Eres un asistente experto en concienciación en ciberseguridad.
Tu tarea es generar el CONTENIDO DE UN CORREO DE PHISHING SIMULADO con fines
ESTRICTAMENTE EDUCATIVOS (entrenamiento interno de awareness, ISO 27001 A.6.3).
NO se usará para atacar a personas reales: solo para simular y medir la
reacción de empleados en un entorno controlado. Bajo ninguna circunstancia
generes contenido dañino, amenazas reales ni instrucciones operativas.

Perfil del destinatario:
- Nombre: ${user.full_name}
- Rol: ${user.role}
- Nivel de dificultad objetivo: ${difficulty} (mapeado de "${user.difficulty_level}")
- Risk score: ${user.risk_score ?? 'N/D'}
- Departamento: ${department?.name || 'No especificado'}

Historial reciente del usuario (adapta el estilo y evita repetir el mismo gancho):
${historyText}

Reglas de generación:
1. Redacta en español, tono realista pero ético.
2. Adapta la dificultad:
   - easy   -> señales evidentes (errores de gramática, remitente sospechoso).
   - medium -> señales más sutiles (contexto creíble, ligera urgencia).
   - hard   -> muy sutil, contexto muy creíble, sin errores obvios.
3. El "body_html" debe ser HTML simple (párrafos, un botón/enlace CTA visible).
   NO incluyas <script>, <iframe> ni estilos inline complejos.
4. Devuelve ÚNICAMENTE un objeto JSON válido con EXACTAMENTE estos campos:
   {
     "name": "título corto descriptivo",
     "subject": "asunto del correo",
     "body_html": "cuerpo HTML del correo",
     "category": "una de: ${ALLOWED_CATEGORIES.join(', ')}",
     "difficulty_level": "una de: easy, medium, hard"
   }

NO incluyas markdown, comentarios, explicaciones ni texto fuera del JSON.`;
}

/**
 * Extrae un objeto JSON de un texto que podría traer fences o texto alrededor.
 */
function extractJson(text) {
  if (!text || typeof text !== 'string') return null;

  // Quita fences tipo ```json ... ``` o ``` ... ```
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Intento directo
  try {
    return JSON.parse(cleaned);
  } catch {
    /* sigue con búsqueda laxa */
  }

  // Búsqueda laxa del primer { ... último }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last > first) {
    const candidate = cleaned.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      /* JSON inválido */
    }
  }
  return null;
}

/**
 * Solicita a Gemini una plantilla adaptada al perfil del usuario.
 * Firma y retorno IDÉNTICOS a la antigua requestAdaptedTemplate de LangFlow.
 */
export async function requestAdaptedTemplate({ user, department, lastResults = [] }) {
  // Fallback controlado: sin API key configurada → warning + null (BD como fallback).
  if (!env.geminiApiKey) {
    console.warn(
      '[geminiService] GEMINI_API_KEY no configurada. Se usará plantilla de BD como fallback.'
    );
    return null;
  }

  try {
    const model = getGeminiModel({
      generationConfig: { responseMimeType: 'application/json' },
    });
    if (!model) {
      console.warn(
        '[geminiService] Modelo Gemini no disponible. Se usará plantilla de BD como fallback.'
      );
      return null;
    }

    const prompt = buildPrompt({ user, department, lastResults });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? '';

    const parsed = extractJson(text);
    if (!parsed) {
      throw new HttpError('Gemini devolvió una respuesta no parseable como JSON', 502);
    }
    if (!parsed.subject || !parsed.body_html) {
      throw new HttpError('Gemini devolvió una plantilla inválida', 502);
    }

    return {
      name: parsed.name || `Auto - ${user.full_name}`,
      subject: parsed.subject,
      body_html: parsed.body_html,
      category: ALLOWED_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : 'urgency',
      difficulty_level:
        parsed.difficulty_level ||
        DIFFICULTY_MAP[user.difficulty_level] ||
        'easy',
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(`Error llamando a Gemini: ${err.message}`, 502);
  }
}
