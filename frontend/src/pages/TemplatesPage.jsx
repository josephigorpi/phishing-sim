// === frontend/src/pages/TemplatesPage.jsx ===
import { useTemplates } from '../hooks/useTemplates.js';
import TemplateCard from '../components/templates/TemplateCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function TemplatesPage() {
  const { templates, loading, error, refetch } = useTemplates();

  if (loading) return <LoadingSpinner text="Cargando plantillas…" />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="page">
      <h1 className="page__title">Plantillas de phishing</h1>
      <p className="page__subtitle">
        Contenidos reutilizables para las campañas adaptativas.
      </p>

      {templates.length === 0 ? (
        <p className="empty-state">No hay plantillas creadas todavía.</p>
      ) : (
        <div className="templates-grid">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
