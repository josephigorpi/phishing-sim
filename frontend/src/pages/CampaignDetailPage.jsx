// === frontend/src/pages/CampaignDetailPage.jsx ===
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCampaignById } from '../services/campaignService.js';
import CampaignDetail from '../components/campaigns/CampaignDetail.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCampaignById(id);
        if (!cancelled) setCampaign(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page">
      <Link to="/campaigns" className="link">
        ← Volver a campañas
      </Link>
      <h1 className="page__title">Detalle de campaña</h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && <CampaignDetail campaign={campaign} />}
    </div>
  );
}
