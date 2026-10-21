// === backend/controllers/resultController.js ===
import { supabase } from '../config/supabaseClient.js';
import { ok, HttpError } from '../utils/httpResponse.js';
import { toInt } from '../utils/validators.js';

export async function list(req, res, next) {
  try {
    const { campaign_id, user_id, status, limit = 100, offset = 0 } = req.query;
    let q = supabase
      .from('campaign_results')
      .select(
        `
        id, campaign_id, user_id, template_id, tracking_token,
        sent_at, opened_at, clicked_at, submitted_data_at, reported_at,
        status, created_at,
        users!user_id ( id, full_name, email, department_id ),
        templates!template_id ( id, name, subject, category, difficulty_level )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });
    if (campaign_id) q = q.eq('campaign_id', Number(campaign_id));
    if (user_id) q = q.eq('user_id', Number(user_id));
    if (status) q = q.eq('status', status);
    q = q.range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error, count } = await q;
    if (error) throw new HttpError(`Error listando resultados: ${error.message}`, 500);
    ok(res, { items: data, total: count });
  } catch (err) {
    next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const id = toInt(req.params.id);
    if (!id) throw new HttpError('ID inválido', 400);
    const { data, error } = await supabase
      .from('campaign_results')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new HttpError(`Error obteniendo resultado: ${error.message}`, 500);
    if (!data) throw new HttpError('Resultado no encontrado', 404);
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
