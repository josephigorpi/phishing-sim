// === backend/controllers/userController.js ===
import * as userService from '../services/userService.js';
import { ok, HttpError } from '../utils/httpResponse.js';
import { toInt } from '../utils/validators.js';

export async function list(req, res, next) {
  try {
    const { department_id, is_active, difficulty, limit, offset } = req.query;
    const result = await userService.listUsers({
      departmentId: department_id ? Number(department_id) : undefined,
      isActive: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      difficulty,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const id = toInt(req.params.id);
    if (!id) throw new HttpError('ID inválido', 400);
    const [user, history] = await Promise.all([
      userService.getUserById(id),
      userService.getUserHistory(id),
    ]);
    ok(res, { ...user, history });
  } catch (err) {
    next(err);
  }
}
