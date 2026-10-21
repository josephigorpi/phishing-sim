// === backend/middlewares/authApiKey.js ===
import { env } from '../config/env.js';

// Valida el header x-webhook-secret contra el secreto esperado
export function authWebhookSecret(expectedSecret, headerName = 'x-webhook-secret') {
  return (req, res, next) => {
    const provided = req.headers[headerName];
    if (!provided || provided !== expectedSecret) {
      return res.status(401).json({ error: true, message: 'Webhook secret inválido' });
    }
    next();
  };
}

export const authN8n = authWebhookSecret(env.n8nWebhookSecret);
export const authLangflow = authWebhookSecret(env.langflowWebhookSecret);
