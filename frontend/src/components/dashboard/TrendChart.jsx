// === frontend/src/components/dashboard/TrendChart.jsx ===
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Gráfico de tendencia mensual.
 * Espera data con forma: [{ month, clickRate, reportRate }, ...]
 */
export default function TrendChart({ data = [] }) {
  if (!data.length) {
    return <p className="empty-state">Sin datos de tendencia disponibles.</p>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="clickRate"
            name="Tasa de clics"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="reportRate"
            name="Tasa de reportes"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
