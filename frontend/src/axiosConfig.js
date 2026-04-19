import axios from 'axios';
import { getToken, clearAuth } from './auth';

const API_URL = 'https://yaris-autocare-production.up.railway.app';

// Set default base URL for ALL axios calls
axios.defaults.baseURL = `${API_URL}/api`;

// Attach token automatically
axios.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

// Handle 401 globally
axios.interceptors.response.use(
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

export default axios;
