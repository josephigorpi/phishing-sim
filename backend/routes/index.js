// === backend/routes/index.js ===
import { Router } from 'express';
import campaigns from './campaigns.routes.js';
import users from './users.routes.js';
import templates from './templates.routes.js';
import results from './results.routes.js';
import reports from './reports.routes.js';
import n8nWebhook from './webhooks/n8n.routes.js';
import trackingWebhook from './webhooks/tracking.routes.js';

const router = Router();

router.get('/health', (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

router.use('/campaigns', campaigns);
router.use('/users', users);
router.use('/templates', templates);
router.use('/results', results);
router.use('/reports', reports);
router.use('/webhooks/n8n', n8nWebhook);
router.use('/webhooks/tracking', trackingWebhook);

export default router;
