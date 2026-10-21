// === backend/services/campaignService.js ===
import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/httpResponse.js';

export async function listCampaigns({ status, limit = 50, offset = 0 } = {}) {
  let q = supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  q = q.range(offset, offset + limit - 1);
  const { data, error, count } = await q;
  if (error) throw new HttpError(`Error listando campañas: ${error.message}`, 500);
  return { items: data, total: count };
}

export async function getCampaignById(id) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new HttpError(`Error obteniendo campaña: ${error.message}`, 500);
  if (!data) throw new HttpError('Campaña no encontrada', 404);
  return data;
}

// Detalle con resultados + usuarios + plantillas joineados
export async function getCampaignDetail(id) {
  const campaign = await getCampaignById(id);
  const { data: results, error } = await supabase
    .from('campaign_results')
    .select(
      `
      id, user_id, template_id, tracking_token,
      sent_at, opened_at, clicked_at, submitted_data_at, reported_at,
      status, created_at,
      users!user_id ( id, full_name, email, risk_score, department_id ),
      templates!template_id ( id, name, subject, category, difficulty_level )
    `
    )
    .eq('campaign_id', id)
    .order('created_at', { ascending: true });
  if (error) throw new HttpError(`Error obteniendo resultados: ${error.message}`, 500);
  return { ...campaign, results: results || [] };
}

export async function createCampaign({
  name,
  scheduledDate = null,
  cronExpression = null,
  status = 'draft',
}) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name,
      scheduled_date: scheduledDate,
      cron_expression: cronExpression,
      status,
    })
    .select()
    .single();
  if (error) throw new HttpError(`Error creando campaña: ${error.message}`, 500);
  return data;
}

export async function updateCampaignStatus(id, status) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new HttpError(`Error actualizando campaña: ${error.message}`, 500);
  if (!data) throw new HttpError('Campaña no encontrada', 404);
  return data;
}
