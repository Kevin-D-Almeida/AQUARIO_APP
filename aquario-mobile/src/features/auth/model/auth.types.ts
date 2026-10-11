export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};
