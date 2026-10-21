// === frontend/src/components/campaigns/CampaignDetail.jsx ===
const statusLabels = {
  draft: 'Borrador',
  scheduled: 'Programada',
  running: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function CampaignDetail({ campaign }) {
  if (!campaign) return null;

  const results = Array.isArray(campaign.results) ? campaign.results : [];

  return (
    <div className="campaign-detail">
      <div className="campaign-detail__header">
        <h2>{campaign.name}</h2>
        <span className={`badge badge--${campaign.status}`}>
          {statusLabels[campaign.status] || campaign.status || '-'}
        </span>
      </div>

      {campaign.description && (
        <p className="campaign-detail__description">{campaign.description}</p>
      )}

      <div className="campaign-detail__meta">
        <div>
          <strong>Inicio:</strong>{' '}
          {campaign.start_date || campaign.startDate || '-'}
        </div>
        <div>
          <strong>Fin:</strong> {campaign.end_date || campaign.endDate || '-'}
        </div>
        <div>
          <strong>Plantilla:</strong>{' '}
          {campaign.template_name || campaign.templateName || campaign.template_id || '-'}
        </div>
      </div>

      <h3>Resultados</h3>
      {results.length === 0 ? (
        <p className="empty-state">Aún no hay resultados para esta campaña.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Área</th>
                <th>Evento</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.user_name || r.userName || r.user_id || '-'}</td>
                  <td>{r.area || r.department || '-'}</td>
                  <td>{r.status || r.event || '-'}</td>
                  <td>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString('es-ES')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
