// === backend/middlewares/logger.js ===
import { supabase } from '../config/supabaseClient.js';

// Logger HTTP simple
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

// Escribe un evento en la tabla logs. No lanza si falla.
export async function logEvent({ eventType, actor = null, relatedTable = null, relatedId = null, description = null }) {
  try {
    const { error } = await supabase.from('logs').insert({
      event_type: eventType,
      actor,
      related_table: relatedTable,
      related_id: relatedId,
      description,
    });
    if (error) console.warn('[logEvent] No se pudo escribir el log:', error.message);
  } catch (err) {
    console.warn('[logEvent] Error inesperado:', err.message);
  }
}
