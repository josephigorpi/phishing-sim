// === backend/routes/reports.routes.js ===
import { Router } from 'express';
import * as ctrl from '../controllers/reportController.js';

const router = Router();
router.get('/dashboard', ctrl.dashboard);
router.get('/dashboard/:departmentId', ctrl.dashboardByDepartment);
export default router;
