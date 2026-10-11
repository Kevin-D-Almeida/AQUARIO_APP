import { api } from "@/src/shared/services/api";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../model/auth.types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", credentials);

  return response.data;
}

export async function register(
  data: RegisterRequest,
): Promise<AuthenticatedUser> {
  const response = await api.post<AuthenticatedUser>("/auth/register", data);
  return response.data;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await api.get<AuthenticatedUser>("/aquariums/me");
  return response.data;
}
