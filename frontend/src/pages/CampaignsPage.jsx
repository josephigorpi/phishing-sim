// === frontend/src/pages/CampaignsPage.jsx ===
import { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns.js';
import { createCampaign } from '../services/campaignService.js';
import CampaignTable from '../components/campaigns/CampaignTable.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { campaigns, loading, error, refetch } = useCampaigns(
    statusFilter || undefined
  );

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createCampaign({ name: newName.trim(), status: 'draft' });
      setNewName('');
      setShowCreate(false);
      refetch();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Campañas</h1>
          <p className="page__subtitle">
            Gestiona las simulaciones de phishing activas y planificadas.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? 'Cancelar' : '+ Nueva campaña'}
        </button>
      </div>

      {showCreate && (
        <form className="card form-inline" onSubmit={handleCreate}>
          <input
            type="text"
            className="input"
            placeholder="Nombre de la campaña"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creando…' : 'Crear campaña'}
          </button>
          {createError && <span className="form-error">{createError}</span>}
        </form>
      )}

      <div className="filter-row">
        <label className="filter-row__label">
          Filtrar por estado:
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="draft">Borrador</option>
            <option value="scheduled">Programada</option>
            <option value="running">En curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}
      {!loading && !error && <CampaignTable campaigns={campaigns} />}
    </div>
  );
}
