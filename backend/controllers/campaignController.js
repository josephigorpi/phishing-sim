// === backend/controllers/campaignController.js ===
import * as campaignService from '../services/campaignService.js';
import { ok, HttpError } from '../utils/httpResponse.js';
import { requireFields, toInt } from '../utils/validators.js';

export async function list(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const result = await campaignService.listCampaigns({
      status,
      limit: limit ? Number(limit) : 50,
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
    ok(res, await campaignService.getCampaignDetail(id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    requireFields(req.body, ['name']);
    const data = await campaignService.createCampaign({
      name: req.body.name,
      scheduledDate: req.body.scheduled_date ?? null,
      cronExpression: req.body.cron_expression ?? null,
      status: req.body.status ?? 'draft',
    });
    ok(res, data, 201);
  } catch (err) {
    next(err);
  }
}
