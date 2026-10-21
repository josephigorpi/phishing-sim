// === backend/utils/validators.js ===
import { HttpError } from './httpResponse.js';

export function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj == null || obj[f] === undefined || obj[f] === null || obj[f] === '');
  if (missing.length > 0) {
    throw new HttpError(`Campos requeridos faltantes: ${missing.join(', ')}`, 400);
  }
}

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}
