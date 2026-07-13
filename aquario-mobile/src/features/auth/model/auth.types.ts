export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};