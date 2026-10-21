// === backend/routes/campaigns.routes.js ===
import { Router } from 'express';
import * as ctrl from '../controllers/campaignController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
router.post('/', ctrl.create);
export default router;
