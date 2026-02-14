import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  type AuthSession,
  clearAuthSession,
  getAuthSession,
  loginWithApi,
  saveAuthSession,
} from '@/lib/auth';
import {
  registerForPushNotificationsAsync,
  setExpoTokenOnApi,
} from '@/lib/push-notifications';

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  authLoading: boolean;
  isAuthenticated: boolean;
  session: AuthSession | null;
  login: (input: LoginInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  const refreshSession = async () => {
    const stored = await getAuthSession();
    setSession(stored);
  };

  useEffect(() => {
    const load = async () => {
      await refreshSession();
      setAuthLoading(false);
    };

    void load();
  }, []);

  const login = async (input: LoginInput) => {
    const newSession = await loginWithApi(input);
    await saveAuthSession(newSession);
    setSession(newSession);

    // Keep sign-in resilient; push registration failures should not block auth.
    try {
      const expoToken = await registerForPushNotificationsAsync();
      if (expoToken) {
        await setExpoTokenOnApi({
          authToken: newSession.token,
          expoToken,
        });
      }
    } catch (error) {
      console.log('Push token registration failed:', error);
    }

    return newSession;
  };

  const logout = async () => {
    await clearAuthSession();
    setSession(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      authLoading,
      isAuthenticated: Boolean(session?.token),
      session,
      login,
      logout,
      refreshSession,
    }),
    [authLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
