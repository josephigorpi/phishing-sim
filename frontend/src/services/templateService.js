// === frontend/src/services/templateService.js ===
import api from './api';

export const getTemplates = async () => {
  const { data } = await api.get('/templates');
  return data.data;
};

export const getTemplateById = async (id) => {
  const { data } = await api.get(`/templates/${id}`);
  return data.data;
};

export const createTemplate = async (payload) => {
  const { data } = await api.post('/templates', payload);
  return data.data;
};

export const updateTemplate = async (id, payload) => {
  const { data } = await api.patch(`/templates/${id}`, payload);
  return data.data;
};

export const deleteTemplate = async (id) => {
  const { data } = await api.delete(`/templates/${id}`);
  return data.data;
};
