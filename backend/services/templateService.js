// === backend/services/templateService.js ===
import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/httpResponse.js';

export async function listTemplates({
  category,
  difficulty,
  departmentId,
  limit = 100,
  offset = 0,
} = {}) {
  let q = supabase
    .from('templates')
    .select('*, departments!target_department_id(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  if (difficulty) q = q.eq('difficulty_level', difficulty);
  if (departmentId) {
    // Plantillas del área del usuario O globales
    q = q.or(`target_department_id.eq.${departmentId},target_department_id.is.null`);
  }
  q = q.range(offset, offset + limit - 1);
  const { data, error, count } = await q;
  if (error) throw new HttpError(`Error listando plantillas: ${error.message}`, 500);
  return { items: data, total: count };
}

export async function getTemplateById(id) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new HttpError(`Error obteniendo plantilla: ${error.message}`, 500);
  if (!data) throw new HttpError('Plantilla no encontrada', 404);
  return data;
}

export async function createTemplate(payload) {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: payload.name,
      subject: payload.subject,
      body_html: payload.body_html,
      category: payload.category,
      difficulty_level: payload.difficulty_level,
      target_department_id: payload.target_department_id ?? null,
      generated_by: payload.generated_by ?? 'manual',
    })
    .select()
    .single();
  if (error) throw new HttpError(`Error creando plantilla: ${error.message}`, 500);
  return data;
}

export async function updateTemplate(id, patch) {
  const { data, error } = await supabase
    .from('templates')
    .update(patch)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new HttpError(`Error actualizando plantilla: ${error.message}`, 500);
  if (!data) throw new HttpError('Plantilla no encontrada', 404);
  return data;
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw new HttpError(`Error eliminando plantilla: ${error.message}`, 500);
  return { deleted: true, id };
}
