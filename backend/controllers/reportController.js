// === backend/controllers/reportController.js ===
import * as reportService from '../services/reportService.js';
import { ok, HttpError } from '../utils/httpResponse.js';
import { toInt } from '../utils/validators.js';

export async function dashboard(req, res, next) {
  try {
    ok(res, await reportService.getDashboardMetrics());
  } catch (err) {
    next(err);
  }
}

export async function dashboardByDepartment(req, res, next) {
  try {
    const id = toInt(req.params.departmentId);
    if (!id) throw new HttpError('departmentId inválido', 400);
    ok(res, await reportService.getAreaReport(id));
  } catch (err) {
    next(err);
  }
}
