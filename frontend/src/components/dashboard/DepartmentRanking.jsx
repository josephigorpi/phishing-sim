// === frontend/src/components/dashboard/DepartmentRanking.jsx ===
export default function DepartmentRanking({ departments = [] }) {
  if (!departments.length) {
    return <p className="empty-state">Sin datos de áreas todavía.</p>;
  }
  const sorted = [...departments].sort((a, b) => (b.click_rate ?? 0) - (a.click_rate ?? 0));

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr><th>#</th><th>Área</th><th>Enviados</th><th>Clics</th><th>Tasa de clics</th></tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr key={d.department_id ?? i}>
              <td>{i + 1}</td>
              <td>{d.name ?? '-'}</td>
              <td>{d.sent ?? '-'}</td>
              <td>{d.clicked ?? '-'}</td>
              <td>{typeof d.click_rate === 'number' ? `${d.click_rate}%` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
