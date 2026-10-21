// === frontend/src/services/userService.js ===
import api from './api';

export const getUsers = async (filters = {}) => {
  const { data } = await api.get('/users', { params: filters });
  return data.data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data;
};
