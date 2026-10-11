import { api } from "@/src/shared/services/api";
import type { AuthenticatedUser } from "../model/auth.types";

export async function uploadProfileAvatar(uri: string) {
  const formData = new FormData();
  formData.append("avatar", {
    uri,
    name: "avatar.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const response = await api.post<AuthenticatedUser>(
    "/users/me/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function removeProfileAvatar() {
  const response = await api.delete<AuthenticatedUser>("/users/me/avatar");
  return response.data;
}

export function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return undefined;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;

  const baseUrl = api.defaults.baseURL?.replace(/\/$/, "");
  return `${baseUrl}${avatarUrl}`;
}
