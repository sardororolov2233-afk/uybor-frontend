import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor to add Telegram InitData for authentication (if needed by backend)
api.interceptors.request.use((config) => {
  if (WebApp.initData) {
    config.headers.Authorization = `tma ${WebApp.initData}`;
  }
  return config;
});

export default api;
