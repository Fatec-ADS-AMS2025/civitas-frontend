'use client';

import { createContext, createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { authStorage, type AuthStorageUser } from '@/lib/auth-storage';

type AuthContextValue = {
  user: AuthStorageUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuthenticatedUser: (user: AuthStorageUser | null) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthStorageUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedUser = authStorage.get();

    if (storedUser) {
      console.info('[AuthProvider] Usuario restaurado do localStorage.', {
        userId: storedUser.id,
      });
      setUser(storedUser);
    } else {
      console.info('[AuthProvider] Nenhum usuario salvo no localStorage.');
    }

    setIsHydrated(true);
  }, []);

  const setAuthenticatedUser = useCallback((nextUser: AuthStorageUser | null) => {
    if (nextUser) {
      authStorage.set(nextUser);
      setUser(nextUser);
      console.info('[AuthProvider] Usuario autenticado e persistido.', {
        userId: nextUser.id,
      });
      return;
    }

    authStorage.clear();
    setUser(null);
    console.info('[AuthProvider] Sessao local removida.');
  }, []);

  const logout = useCallback(() => setAuthenticatedUser(null), [setAuthenticatedUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      setAuthenticatedUser,
      logout,
    }),
    [user, isHydrated, setAuthenticatedUser, logout]
  );

  return createElement(AuthContext.Provider, { value }, children);
}
