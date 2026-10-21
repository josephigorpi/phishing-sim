// === backend/routes/webhooks/n8n.routes.js ===
import { Router } from 'express';
import { authN8n } from '../../middlewares/authApiKey.js';
import * as ctrl from '../../controllers/webhooks/n8nWebhookController.js';

const router = Router();
// Disparo del cron mensual (protegido por x-webhook-secret)
router.post('/', authN8n, ctrl.triggerMonthlyCampaign);
export default router;
