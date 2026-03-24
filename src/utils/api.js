import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://reconciler-backend-dprj.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('reconciler_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('reconciler_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
