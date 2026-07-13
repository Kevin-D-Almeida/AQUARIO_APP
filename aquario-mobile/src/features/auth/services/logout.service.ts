import { removeAccessToken } from '@/src/shared/storage/auth-token.storage';

export async function logout(): Promise<void> {
  await removeAccessToken();
}