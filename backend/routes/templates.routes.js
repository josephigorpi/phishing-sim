// === backend/routes/templates.routes.js ===
import { Router } from 'express';
import * as ctrl from '../controllers/templateController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
export default router;
