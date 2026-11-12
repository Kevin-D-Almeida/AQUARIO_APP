import { api } from "@/src/shared/services/api";

export async function requestPasswordReset(email: string) {
  const response = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
  );
  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await api.post<{ message: string }>("/auth/reset-password", {
    token,
    password,
  });
  return response.data;
}

export async function deleteAccount(password: string) {
  const response = await api.delete<{ message: string }>("/users/me", {
    data: { password },
  });
  return response.data;
}
