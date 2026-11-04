// === frontend/src/pages/DashboardByDepartment.jsx ===
import { useEffect, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData.js';
import { getDashboard } from '../services/reportService.js';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import DepartmentRanking from '../components/dashboard/DepartmentRanking.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function DashboardByDepartment() {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => {
        if (!cancelled) setDepartments(data?.byArea || []); // antes: data?.departments
      })
      .catch(() => {
        if (!cancelled) setDepartments([]);
      });
    return () => { cancelled = true; };
  }, []);

  const { data, loading, error, refetch } = useDashboardData(
    departmentId ? departmentId : null
  );
  const totals = data?.totals || {};
  const rates = data?.rates || {};

  return (
    <div className="page">
      <h1 className="page__title">Dashboard por área</h1>
      <p className="page__subtitle">
        Selecciona un área para analizar su desempeño frente a simulaciones.
      </p>

      <div className="filter-row">
        <label className="filter-row__label">
          Área:
          <select
            className="select"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">— Selecciona un área —</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!departmentId && (
        <p className="empty-state">Elige un área para ver sus métricas de riesgo.</p>
      )}

      {departmentId && loading && <LoadingSpinner />}
      {departmentId && error && <ErrorMessage message={error} onRetry={refetch} />}

      {departmentId && data && (
        <>
          <div className="metrics-grid">
            <MetricCard title="Correos enviados" value={totals.sent ?? 0} />
            <MetricCard title="Tasa de clics" value={`${rates.click_rate ?? 0}%`} variant="warning" />
            <MetricCard title="Tasa de reportes" value={`${rates.report_rate ?? 0}%`} variant="success" />
            <MetricCard title="Tasa de compromiso" value={`${rates.compromise_rate ?? 0}%`} variant="info" />
          </div>

          <section className="card">
            <h2 className="card__title">Tendencia mensual</h2>
            <TrendChart data={data.monthlyTrend || []} />
          </section>

          <section className="card">
            <h2 className="card__title">Ranking de áreas</h2>
            <DepartmentRanking departments={data.byArea || []} />
          </section>
        </>
      )}
    </div>
  );
}
