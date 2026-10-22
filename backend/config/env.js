// === backend/config/env.js ===
import dotenv from 'dotenv';
dotenv.config();

// Valida variables de entorno obligatorias al arrancar
const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'N8N_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[env] Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  resendFromName: process.env.RESEND_FROM_NAME || 'Security Awareness',
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  backendPublicUrl:
    process.env.BACKEND_PUBLIC_URL ||
    `http://localhost:${Number(process.env.PORT) || 3000}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  educationalRedirectUrl:
    process.env.EDUCATIONAL_REDIRECT_URL || 'https://example.com/awareness',
  corsOrigin: (process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [] || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
