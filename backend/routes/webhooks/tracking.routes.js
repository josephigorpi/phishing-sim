// === backend/routes/webhooks/tracking.routes.js ===
import { Router } from 'express';
import * as ctrl from '../../controllers/webhooks/trackingWebhookController.js';
import { trackingLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();
router.get('/:token/open', trackingLimiter, ctrl.trackOpen);
router.get('/:token/click', trackingLimiter, ctrl.trackClick);
router.post('/:token/report', trackingLimiter, ctrl.trackReport);
export default router;
