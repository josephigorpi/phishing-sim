// === backend/server.js ===
import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(
    `[server] phishing-sim backend escuchando en puerto ${env.port} (${env.nodeEnv})`
  );
});

// Cierre ordenado
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM recibido, cerrando...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('[server] SIGINT recibido, cerrando...');
  server.close(() => process.exit(0));
});
