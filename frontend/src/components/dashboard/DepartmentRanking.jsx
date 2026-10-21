// === frontend/src/components/dashboard/DepartmentRanking.jsx ===
/**
 * Ranking de áreas ordenado por risk_score descendente.
 * Espera: [{ id, name, employees, riskScore }, ...]
 */
export default function DepartmentRanking({ departments = [] }) {
  if (!departments.length) {
    return <p className="empty-state">Sin datos de áreas todavía.</p>;
  }

  const sorted = [...departments].sort(
    (a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)
  );

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Área</th>
            <th>Empleados</th>
            <th>Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr key={d.id ?? i}>
              <td>{i + 1}</td>
              <td>{d.name ?? '-'}</td>
              <td>{d.employees ?? '-'}</td>
              <td>
                {typeof d.riskScore === 'number'
                  ? d.riskScore.toFixed(1)
                  : d.riskScore ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
