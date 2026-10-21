// === frontend/src/pages/NotFoundPage.jsx ===
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page page--center">
      <h1 className="page__title">404 · Página no encontrada</h1>
      <p className="page__subtitle">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/dashboard" className="btn-primary">
        Volver al dashboard
      </Link>
    </div>
  );
}
