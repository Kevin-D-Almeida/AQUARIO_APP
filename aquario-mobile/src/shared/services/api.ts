import { create, isAxiosError } from "axios";

import { getAccessToken } from "../storage/auth-token.storage";

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não foi configurada. Crie o arquivo .env usando .env.example como base.",
  );
}

export const api = create({
  baseURL: apiUrl,
  adapter: "fetch",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setUnauthorizedHandler(
  handler: (() => void | Promise<void>) | null,
) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      await unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
