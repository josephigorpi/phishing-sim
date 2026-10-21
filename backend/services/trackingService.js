// === backend/services/trackingService.js ===
import { supabase } from '../config/supabaseClient.js';
import { generateTrackingToken } from '../utils/trackingToken.js';
import { HttpError } from '../utils/httpResponse.js';

const RESULT_SELECT =
  'id, campaign_id, user_id, template_id, tracking_token, sent_at, opened_at, clicked_at, submitted_data_at, reported_at, status, created_at';

// Genera un tracking_token único verificando colisión en BD
export async function createTrackingToken() {
  for (let i = 0; i < 5; i++) {
    const token = generateTrackingToken();
    const { data, error } = await supabase
      .from('campaign_results')
      .select('id')
      .eq('tracking_token', token)
      .maybeSingle();
    if (error) throw new HttpError(`Error verificando token: ${error.message}`, 500);
    if (!data) return token;
  }
  throw new HttpError('No se pudo generar un tracking_token único', 500);
}

// Crea un registro base en campaign_results con estado 'pending'
export async function createCampaignResult({ campaignId, userId, templateId }) {
  const token = await createTrackingToken();
  const { data, error } = await supabase
    .from('campaign_results')
    .insert({
      campaign_id: campaignId,
      user_id: userId,
      template_id: templateId,
      tracking_token: token,
      status: 'pending',
    })
    .select(RESULT_SELECT)
    .single();
  if (error) throw new HttpError(`Error creando campaign_result: ${error.message}`, 500);
  return data;
}

export async function getResultByToken(token) {
  const { data, error } = await supabase
    .from('campaign_results')
    .select(RESULT_SELECT)
    .eq('tracking_token', token)
    .maybeSingle();
  if (error) throw new HttpError(`Error buscando token: ${error.message}`, 500);
  return data;
}

// --- Transiciones de estado ---

export async function markSent(token) {
  return updateResult(token, { sent_at: new Date().toISOString(), status: 'sent' });
}

export async function markOpened(token) {
  const existing = await getResultByToken(token);
  if (!existing) return null;
  const upd = { opened_at: existing.opened_at || new Date().toISOString() };
  if (['pending', 'sent'].includes(existing.status)) upd.status = 'opened';
  return updateResult(token, upd);
}

export async function markClicked(token) {
  const existing = await getResultByToken(token);
  if (!existing) return null;
  const now = new Date().toISOString();
  const upd = {
    clicked_at: existing.clicked_at || now,
    opened_at: existing.opened_at || now, // un clic implica apertura
  };
  if (['pending', 'sent', 'opened'].includes(existing.status)) upd.status = 'clicked';
  return updateResult(token, upd);
}

export async function markSubmittedData(token) {
  const existing = await getResultByToken(token);
  if (!existing) return null;
  const now = new Date().toISOString();
  const upd = {
    submitted_data_at: existing.submitted_data_at || now,
    clicked_at: existing.clicked_at || now,
    opened_at: existing.opened_at || now,
  };
  if (['pending', 'sent', 'opened', 'clicked'].includes(existing.status)) {
    upd.status = 'compromised';
  }
  return updateResult(token, upd);
}

// Reportar es POSITIVO (baja el risk_score) y sobreescribe el estado
export async function markReported(token) {
  const existing = await getResultByToken(token);
  if (!existing) return null;
  const upd = {
    reported_at: existing.reported_at || new Date().toISOString(),
    status: 'reported',
  };
  return updateResult(token, upd);
}

async function updateResult(token, patch) {
  const { data, error } = await supabase
    .from('campaign_results')
    .update(patch)
    .eq('tracking_token', token)
    .select(RESULT_SELECT)
    .maybeSingle();
  if (error) throw new HttpError(`Error actualizando resultado: ${error.message}`, 500);
  if (!data) return null;
  // Recalcula el risk_score del usuario afectado
  if (data.user_id) {
    await recalculateUserRiskScore(data.user_id).catch((e) =>
      console.warn('[trackingService] risk_score:', e.message)
    );
  }
  return data;
}

/**
 * Recalcula el risk_score del usuario a partir de su historial.
 * Contribuciones (0=bajo riesgo, 100=alto):
 *   reported -> 0
 *   comprometido -> 100
 *   clic -> 70
 *   solo abierto -> 30
 *   enviado sin interacción -> 5
 */
export async function recalculateUserRiskScore(userId) {
  const { data: results, error } = await supabase
    .from('campaign_results')
    .select('status, opened_at, clicked_at, submitted_data_at, reported_at')
    .eq('user_id', userId);
  if (error) throw new HttpError(`Error cargando historial: ${error.message}`, 500);
  if (!results || results.length === 0) return 0;

  const contributions = results.map((r) => {
    if (r.reported_at || r.status === 'reported') return 0;
    if (r.submitted_data_at || r.status === 'compromised') return 100;
    if (r.clicked_at || r.status === 'clicked') return 70;
    if (r.opened_at || r.status === 'opened') return 30;
    return 5;
  });
  const avg = contributions.reduce((a, b) => a + b, 0) / contributions.length;
  const score = Math.round(avg * 100) / 100;

  const { error: updErr } = await supabase
    .from('users')
    .update({ risk_score: score })
    .eq('id', userId);
  if (updErr) throw new HttpError(`Error actualizando risk_score: ${updErr.message}`, 500);
  return score;
}
