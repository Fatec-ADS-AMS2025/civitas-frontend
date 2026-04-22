'use client';

import { useCallback, useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { usuarioService } from '@/hooks/usuario';

type LoginInput = {
  email: string;
  password: string;
};

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha invalidos. Verifique os dados e tente novamente.';
const GENERIC_LOGIN_ERROR_MESSAGE = 'Nao foi possivel entrar agora. Tente novamente em instantes.';

const normalizeText = (value: string) => value.trim();
const normalizeEmail = (value: string) => normalizeText(value).toLowerCase();

export function useAuth() {
  const context = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider.');

  const login = useCallback(async ({ email, password }: LoginInput) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizeText(password);

    setError('');
    setIsLoading(true);
    console.info('[useAuth] Iniciando login.', { email: normalizedEmail });

    try {
      const matchedUser = await usuarioService.authenticate(normalizedEmail, normalizedPassword);

      if (!matchedUser) {
        console.warn('[useAuth] Credenciais invalidas.', { email: normalizedEmail });
        setError(INVALID_CREDENTIALS_MESSAGE);
        return null;
      }

      const authUser = { id: matchedUser.id, nome: matchedUser.nome };
      context.setAuthenticatedUser(authUser);
      console.info('[useAuth] Login concluido com sucesso.', { userId: matchedUser.id });
      return authUser;
    } catch (loginError) {
      console.error('[useAuth] Erro tecnico ao realizar login.', loginError);
      setError(GENERIC_LOGIN_ERROR_MESSAGE);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const clearError = useCallback(() => setError(''), []);

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isHydrated: context.isHydrated,
    isLoading,
    error,
    login,
    logout: context.logout,
    clearError,
  };
}
