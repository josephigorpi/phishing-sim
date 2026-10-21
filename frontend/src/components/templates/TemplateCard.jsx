// === frontend/src/components/templates/TemplateCard.jsx ===
export default function TemplateCard({ template, onSelect, onDelete }) {
  const preview =
    (template.body || template.content || '').slice(0, 120) || 'Sin contenido';

  return (
    <div className="template-card">
      <div className="template-card__header">
        <h3 className="template-card__name">{template.name}</h3>
        <span className="badge">{template.difficulty || 'N/A'}</span>
      </div>

      {template.subject && (
        <p className="template-card__subject">
          <strong>Asunto:</strong> {template.subject}
        </p>
      )}

      <p className="template-card__preview">{preview}…</p>

      {(onSelect || onDelete) && (
        <div className="template-card__actions">
          {onSelect && (
            <button className="btn-secondary" onClick={() => onSelect(template)}>
              Ver
            </button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={() => onDelete(template.id)}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
