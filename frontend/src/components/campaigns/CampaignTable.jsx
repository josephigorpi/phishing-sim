// === frontend/src/components/campaigns/CampaignTable.jsx ===
import { Link } from 'react-router-dom';

const statusLabels = {
  draft: 'Borrador',
  scheduled: 'Programada',
  running: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function CampaignTable({ campaigns = [] }) {
  if (!campaigns.length) {
    return <p className="empty-state">No hay campañas para mostrar.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Plantilla</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <span className={`badge badge--${c.status}`}>
                  {statusLabels[c.status] || c.status || '-'}
                </span>
              </td>
              <td>{c.start_date || c.startDate || '-'}</td>
              <td>{c.end_date || c.endDate || '-'}</td>
              <td>{c.template_name || c.templateName || c.template_id || '-'}</td>
              <td>
                <Link to={`/campaigns/${c.id}`} className="link">
                  Ver detalle →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
