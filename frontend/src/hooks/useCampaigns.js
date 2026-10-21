// === frontend/src/hooks/useCampaigns.js ===
import { useCallback, useEffect, useState } from 'react';
import { getCampaigns } from '../services/campaignService';

/**
 * Hook que encapsula el fetch de campañas + estados loading/error.
 * @param {string|undefined} status - filtro opcional por estado
 */
export function useCampaigns(status) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns(status);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}
