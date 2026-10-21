// === backend/services/userService.js ===
import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/httpResponse.js';

export async function listUsers({
  departmentId,
  isActive,
  difficulty,
  limit = 100,
  offset = 0,
} = {}) {
  let q = supabase
    .from('users')
    .select('*, departments!department_id(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (departmentId) q = q.eq('department_id', departmentId);
  if (typeof isActive === 'boolean') q = q.eq('is_active', isActive);
  if (difficulty) q = q.eq('difficulty_level', difficulty);
  q = q.range(offset, offset + limit - 1);
  const { data, error, count } = await q;
  if (error) throw new HttpError(`Error listando usuarios: ${error.message}`, 500);
  return { items: data, total: count };
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*, departments!department_id(id, name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new HttpError(`Error obteniendo usuario: ${error.message}`, 500);
  if (!data) throw new HttpError('Usuario no encontrado', 404);
  return data;
}

export async function getActiveUsersForCampaign() {
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, full_name, email, department_id, role, difficulty_level, risk_score'
    )
    .eq('is_active', true);
  if (error) throw new HttpError(`Error obteniendo usuarios activos: ${error.message}`, 500);
  return data || [];
}

export async function getUserHistory(userId) {
  const { data, error } = await supabase
    .from('campaign_results')
    .select(
      'id, campaign_id, template_id, status, sent_at, opened_at, clicked_at, submitted_data_at, reported_at, created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new HttpError(`Error obteniendo historial: ${error.message}`, 500);
  return data || [];
}
