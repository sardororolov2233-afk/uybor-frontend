import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor to add Telegram InitData for authentication (if needed by backend)
api.interceptors.request.use((config) => {
  try {
    if (WebApp && WebApp.initData) {
      config.headers.Authorization = `tma ${WebApp.initData}`;
    }
  } catch (e) {
    console.error("Auth interceptor error:", e);
  }
  return config;
});

export default api;
