// === backend/routes/results.routes.js ===
import { Router } from 'express';
import * as ctrl from '../controllers/resultController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
export default router;
