import { api } from '@/src/shared/services/api';
import type {
  LoginRequest,
  LoginResponse,
} from '../model/auth.types';

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    credentials,
  );

  return response.data;
}