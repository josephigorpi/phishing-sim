// === backend/services/reportService.js ===
import { supabase } from '../config/supabaseClient.js';
import { HttpError } from '../utils/httpResponse.js';

/**
 * Agrega métricas para el dashboard global o por área.
 * Hace joins mínimos y agrega en memoria (volumen bajo, simplicidad > optimización).
 */
export async function getDashboardMetrics({ departmentId = null } = {}) {
  const { data: results, error } = await supabase.from('campaign_results').select(`
    id, status, opened_at, clicked_at, submitted_data_at, reported_at, sent_at, created_at, campaign_id, user_id,
    users!user_id ( id, department_id, risk_score, full_name, email )
  `);
  if (error) throw new HttpError(`Error cargando resultados: ${error.message}`, 500);

  const filtered = departmentId
    ? (results || []).filter(
        (r) => r.users && r.users.department_id === Number(departmentId)
      )
    : results || [];

  // 1. Totales
  const totals = {
    total: filtered.length,
    sent: filtered.filter((r) => r.sent_at).length,
    opened: filtered.filter((r) => r.opened_at).length,
    clicked: filtered.filter((r) => r.clicked_at).length,
    compromised: filtered.filter((r) => r.submitted_data_at).length,
    reported: filtered.filter((r) => r.reported_at).length,
  };
  const rate = (num, den) => (den > 0 ? Math.round((num / den) * 10000) / 100 : 0);
  const rates = {
    open_rate: rate(totals.opened, totals.sent),
    click_rate: rate(totals.clicked, totals.sent),
    compromise_rate: rate(totals.compromised, totals.sent),
    report_rate: rate(totals.reported, totals.sent),
  };

  // 2. Tendencia mensual (por YYYY-MM del sent_at)
  const trendMap = new Map();
  for (const r of filtered) {
    if (!r.sent_at) continue;
    const key = r.sent_at.slice(0, 7);
    if (!trendMap.has(key)) {
      trendMap.set(key, { month: key, sent: 0, opened: 0, clicked: 0, reported: 0 });
    }
    const m = trendMap.get(key);
    m.sent += 1;
    if (r.opened_at) m.opened += 1;
    if (r.clicked_at) m.clicked += 1;
    if (r.reported_at) m.reported += 1;
  }
  const monthlyTrend = Array.from(trendMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // 3. Tasa de clics por área (usando TODOS los resultados, no el filtro)
  const { data: departments, error: dErr } = await supabase
    .from('departments')
    .select('id, name');
  if (dErr) throw new HttpError(`Error cargando departamentos: ${dErr.message}`, 500);

  const byAreaMap = new Map();
  for (const d of departments || []) {
    byAreaMap.set(d.id, {
      department_id: d.id,
      name: d.name,
      sent: 0,
      clicked: 0,
    });
  }
  for (const r of results || []) {
    const deptId = r.users?.department_id;
    if (!deptId) continue;
    const row = byAreaMap.get(deptId);
    if (!row) continue;
    if (r.sent_at) row.sent += 1;
    if (r.clicked_at) row.clicked += 1;
  }
  const byArea = Array.from(byAreaMap.values()).map((r) => ({
    ...r,
    click_rate: r.sent > 0 ? Math.round((r.clicked / r.sent) * 10000) / 100 : 0,
  }));

  // 4. Top usuarios de mayor riesgo
  const { data: topUsers, error: uErr } = await supabase
    .from('users')
    .select('id, full_name, email, risk_score, department_id, difficulty_level')
    .order('risk_score', { ascending: false })
    .limit(10);
  if (uErr) throw new HttpError(`Error cargando top usuarios: ${uErr.message}`, 500);

  return {
    totals,
    rates,
    monthlyTrend,
    byArea,
    topRiskUsers: topUsers || [],
  };
}

export async function getAreaReport(departmentId) {
  return getDashboardMetrics({ departmentId });
}
