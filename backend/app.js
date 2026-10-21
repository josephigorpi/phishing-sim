// === backend/app.js ===
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/logger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

// Seguridad + parsing
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Observabilidad + rate limit
app.use(requestLogger);
app.use(generalLimiter);

// Rutas
app.use('/api', apiRoutes);

// 404 + handler central
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
