// === backend/controllers/templateController.js ===
import * as templateService from '../services/templateService.js';
import { ok, HttpError } from '../utils/httpResponse.js';
import { requireFields, toInt } from '../utils/validators.js';

export async function list(req, res, next) {
  try {
    const { category, difficulty, department_id, limit, offset } = req.query;
    const result = await templateService.listTemplates({
      category,
      difficulty,
      departmentId: department_id ? Number(department_id) : undefined,
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
    ok(res, await templateService.getTemplateById(id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    requireFields(req.body, ['name', 'subject', 'body_html', 'category', 'difficulty_level']);
    ok(res, await templateService.createTemplate(req.body), 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = toInt(req.params.id);
    if (!id) throw new HttpError('ID inválido', 400);
    ok(res, await templateService.updateTemplate(id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = toInt(req.params.id);
    if (!id) throw new HttpError('ID inválido', 400);
    ok(res, await templateService.deleteTemplate(id));
  } catch (err) {
    next(err);
  }
}
