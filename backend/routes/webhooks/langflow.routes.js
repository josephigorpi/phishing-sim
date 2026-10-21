// === backend/routes/webhooks/langflow.routes.js ===
import { Router } from 'express';
import { authLangflow } from '../../middlewares/authApiKey.js';
import * as ctrl from '../../controllers/webhooks/langflowWebhookController.js';

const router = Router();
// Callback asíncrono de LangFlow (protegido por x-webhook-secret)
router.post('/', authLangflow, ctrl.receiveTemplate);
export default router;
