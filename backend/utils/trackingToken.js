// === backend/utils/trackingToken.js ===
import { customAlphabet } from 'nanoid';

// Alfabeto url-safe, sin caracteres ambiguos
const generate = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);

export function generateTrackingToken() {
  return `trk_${generate()}`;
}
