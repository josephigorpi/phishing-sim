// === frontend/src/components/dashboard/MetricCard.jsx ===
/**
 * Tarjeta de métrica individual.
 * variant: 'primary' | 'success' | 'warning' | 'info' | 'neutral'
 */
export default function MetricCard({ title, value, subtitle, variant = 'primary' }) {
  return (
    <div className={`metric-card metric-card--${variant}`}>
      <p className="metric-card__title">{title}</p>
      <p className="metric-card__value">{value}</p>
      {subtitle && <p className="metric-card__subtitle">{subtitle}</p>}
    </div>
  );
}
