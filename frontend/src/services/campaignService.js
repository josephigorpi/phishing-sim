// === frontend/src/services/campaignService.js ===
import api from './api';

export const getCampaigns = async (status) => {
  const params = status ? { status } : {};
  const { data } = await api.get('/campaigns', { params });
  return data.data;
};

export const getCampaignById = async (id) => {
  const { data } = await api.get(`/campaigns/${id}`);
  return data.data;
};

export const createCampaign = async (payload) => {
  const { data } = await api.post('/campaigns', payload);
  return data.data;
};
