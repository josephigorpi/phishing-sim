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
  // Listado de áreas: lo tomamos del dashboard global (una sola vez)
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => {
        if (!cancelled) setDepartments(data?.departments || []);
      })
      .catch(() => {
        if (!cancelled) setDepartments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // null => no fetch si aún no se ha elegido área
  const { data, loading, error, refetch } = useDashboardData(
    departmentId ? departmentId : null
  );

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
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!departmentId && (
        <p className="empty-state">
          Elige un área para ver sus métricas de riesgo.
        </p>
      )}

      {departmentId && loading && <LoadingSpinner />}
      {departmentId && error && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {departmentId && data && (
        <>
          <div className="metrics-grid">
            <MetricCard
              title="Campañas del área"
              value={data.totalCampaigns ?? 0}
            />
            <MetricCard
              title="Tasa de clics"
              value={`${data.clickRate ?? 0}%`}
              variant="warning"
            />
            <MetricCard
              title="Tasa de reportes"
              value={`${data.reportRate ?? 0}%`}
              variant="success"
            />
            <MetricCard
              title="Risk Score del área"
              value={
                typeof data.riskScore === 'number'
                  ? data.riskScore.toFixed(1)
                  : data.riskScore ?? '-'
              }
              variant="info"
            />
          </div>

          <section className="card">
            <h2 className="card__title">Tendencia mensual</h2>
            <TrendChart data={data.trend || []} />
          </section>

          <section className="card">
            <h2 className="card__title">Ranking de áreas</h2>
            <DepartmentRanking departments={data.departments || []} />
          </section>
        </>
      )}
    </div>
  );
}
