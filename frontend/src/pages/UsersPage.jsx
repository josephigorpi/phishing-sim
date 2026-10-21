// === frontend/src/pages/UsersPage.jsx ===
import { useEffect, useState } from 'react';
import { getUsers } from '../services/userService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(loadUsers, []);

  if (loading) return <LoadingSpinner text="Cargando usuarios…" />;
  if (error) return <ErrorMessage message={error} onRetry={loadUsers} />;

  return (
    <div className="page">
      <h1 className="page__title">Usuarios</h1>
      <p className="page__subtitle">
        Empleados registrados y su nivel de riesgo actual.
      </p>

      {users.length === 0 ? (
        <p className="empty-state">No hay usuarios registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Área</th>
                <th>Dificultad</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || u.full_name || u.fullName || '-'}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.area || u.department || '-'}</td>
                  <td>{u.difficulty || '-'}</td>
                  <td>
                    {typeof u.risk_score === 'number'
                      ? u.risk_score.toFixed(1)
                      : u.riskScore ?? '-'}
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
