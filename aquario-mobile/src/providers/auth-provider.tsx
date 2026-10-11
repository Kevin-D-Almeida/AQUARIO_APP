import { router } from "expo-router";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AuthenticatedUser,
  LoginRequest,
  RegisterRequest,
} from "../features/auth/model/auth.types";
import {
  getCurrentUser,
  login,
  register,
} from "../features/auth/services/auth.service";
import { setUnauthorizedHandler } from "../shared/services/api";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "../shared/storage/auth-token.storage";
import { queryClient } from "./query-provider";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  signIn: (data: LoginRequest) => Promise<void>;
  signUp: (data: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthenticatedUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const signOut = useCallback(async () => {
    await removeAccessToken();
    queryClient.clear();
    setUser(null);
    router.replace("/login");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getAccessToken();
        if (!token) return;
        setUser(await getCurrentUser());
      } catch {
        await removeAccessToken();
      } finally {
        setIsRestoringSession(false);
      }
    }
    restoreSession();
  }, []);

  const signIn = useCallback(async (data: LoginRequest) => {
    const result = await login(data);
    await saveAccessToken(result.accessToken);
    setUser(result.user);
    router.replace("/aquariums");
  }, []);

  const signUp = useCallback(
    async (data: RegisterRequest) => {
      await register(data);
      await signIn({ email: data.email, password: data.password });
    },
    [signIn],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isRestoringSession,
      signIn,
      signUp,
      signOut,
      updateUser: setUser,
    }),
    [isRestoringSession, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
