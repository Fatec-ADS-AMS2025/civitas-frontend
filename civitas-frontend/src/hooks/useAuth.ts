'use client';

import { useCallback, useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { showToast } from '@/hooks/useToast';
import type { AuthStorageUser } from '@/lib/auth-storage';

type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  expiresAtUtc: string;
  usuario: {
    id: number;
    nome: string;
    email?: string;
    tipoUsuario?: string | number;
  };
};

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha invalidos. Verifique os dados e tente novamente.';
const GENERIC_LOGIN_ERROR_MESSAGE = 'Nao foi possivel entrar agora. Tente novamente em instantes.';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api';

const normalizeText = (value: string) => value.trim();
const normalizeEmail = (value: string) => normalizeText(value).toLowerCase();

const extractEnvelopeData = <T,>(payload: unknown): T | null => {
  if (typeof payload !== 'object' || payload === null) return null;
  if (!('data' in payload)) return payload as T;
  return (payload as { data?: T | null }).data ?? null;
};

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
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          senha: normalizedPassword,
        }),
      });

      const payload = await response.json().catch(() => null);
      const loginResponse = extractEnvelopeData<LoginResponse>(payload);

      if (!response.ok || !loginResponse?.usuario || !loginResponse.token) {
        const message =
          typeof payload?.message === 'string' && payload.message.trim() !== ''
            ? payload.message
            : response.status === 401
              ? INVALID_CREDENTIALS_MESSAGE
              : GENERIC_LOGIN_ERROR_MESSAGE;

        console.warn('[useAuth] Falha de autenticacao.', { email: normalizedEmail, status: response.status });
        setError(response.status === 401 ? INVALID_CREDENTIALS_MESSAGE : message);
        return null;
      }

      const authUser: AuthStorageUser = {
        id: loginResponse.usuario.id,
        nome: loginResponse.usuario.nome,
        email: loginResponse.usuario.email,
        token: loginResponse.token,
        expiresAtUtc: loginResponse.expiresAtUtc,
        tipoUsuario: loginResponse.usuario.tipoUsuario,
      };

      context.setAuthenticatedUser(authUser);
      showToast('Login realizado com sucesso.', 'success');
      console.info('[useAuth] Login concluido com sucesso.', { userId: loginResponse.usuario.id });
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

export default useAuth;
