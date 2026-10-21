// === backend/routes/users.routes.js ===
import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
export default router;
