import axios from 'axios';

import { getAccessToken } from '../storage/auth-token.storage';

export const api = axios.create({
  baseURL: 'http://10.70.41.27:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});