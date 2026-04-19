import axios from 'axios';
import { getToken, clearAuth } from './auth';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

// Handle expired / invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuth();

      if (window.location.pathname !== '/login') {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        );

        window.location.href = `/login?next=${next}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
