// === frontend/src/pages/DashboardGeneral.jsx ===
import { useDashboardData } from '../hooks/useDashboardData.js';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import DepartmentRanking from '../components/dashboard/DepartmentRanking.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function DashboardGeneral() {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) return <LoadingSpinner text="Cargando métricas globales…" />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const d = data || {};

  return (
    <div className="page">
      <h1 className="page__title">Dashboard general</h1>
      <p className="page__subtitle">
        Métricas agregadas de todas las simulaciones de phishing.
      </p>

      <div className="metrics-grid">
        <MetricCard
          title="Campañas totales"
          value={d.totalCampaigns ?? 0}
          variant="primary"
        />
        <MetricCard
          title="Tasa de clics"
          value={`${d.clickRate ?? 0}%`}
          variant="warning"
        />
        <MetricCard
          title="Tasa de reportes"
          value={`${d.reportRate ?? 0}%`}
          variant="success"
        />
        <MetricCard
          title="Risk Score global"
          value={
            typeof d.riskScore === 'number'
              ? d.riskScore.toFixed(1)
              : d.riskScore ?? '-'
          }
          variant="info"
        />
      </div>

      <section className="card">
        <h2 className="card__title">Tendencia mensual</h2>
        <TrendChart data={d.trend || []} />
      </section>

      <section className="card">
        <h2 className="card__title">Ranking por área</h2>
        <DepartmentRanking departments={d.departments || []} />
      </section>
    </div>
  );
}
