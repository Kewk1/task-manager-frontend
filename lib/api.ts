import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});



// Otomatikong ikakabit ang Bearer token sa bawat request kapag naka-login na
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// [DAGDAG DITO]: Named Exports para sa Developers API
export const getDevelopers = async () => {
  const response = await api.get('/developers');
  return response.data;
};

export const updateDeveloper = async (id: number | string, data: any) => {
  const response = await api.put(`/developers/${id}`, data);
  return response.data;
};

export const deleteDeveloper = async (id: number | string) => {
  const response = await api.delete(`/developers/${id}`);
  return response.data;
};
export default api;

