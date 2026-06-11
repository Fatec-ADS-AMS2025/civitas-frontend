'use client';

import { useCallback, useState } from 'react';
import { showToast } from '@/hooks/useToast';

type ForgotPasswordInput = {
  email: string;
};

type ForgotPasswordResult = {
  message: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api';
const FORGOT_PASSWORD_ENDPOINT = `${BASE_URL}/auth/forgot-password`;
const USE_REAL_FORGOT_PASSWORD_REQUEST = process.env.NEXT_PUBLIC_FORGOT_PASSWORD_REAL_REQUEST === 'true';
const SIMULATED_REQUEST_DELAY_MS = 900;

const SUCCESS_MESSAGE = 'Se este e-mail estiver cadastrado, as instrucoes de recuperacao serao enviadas.';
const GENERIC_ERROR_MESSAGE = 'Nao foi possivel solicitar a recuperacao agora. Tente novamente em instantes.';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const wait = (timeInMs: number) => new Promise((resolve) => window.setTimeout(resolve, timeInMs));

const extractMessage = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null) return '';

  const possiblePayload = payload as { message?: unknown; error?: unknown };

  if (typeof possiblePayload.message === 'string' && possiblePayload.message.trim() !== '') {
    return possiblePayload.message;
  }

  if (typeof possiblePayload.error === 'string' && possiblePayload.error.trim() !== '') {
    return possiblePayload.error;
  }

  return '';
};

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const requestPasswordRecovery = useCallback(async ({ email }: ForgotPasswordInput): Promise<ForgotPasswordResult | null> => {
    const normalizedEmail = normalizeEmail(email);

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (USE_REAL_FORGOT_PASSWORD_REQUEST) {
        const response = await fetch(FORGOT_PASSWORD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(extractMessage(payload) || GENERIC_ERROR_MESSAGE);
        }
      } else {
        await wait(SIMULATED_REQUEST_DELAY_MS);
      }

      setSuccessMessage(SUCCESS_MESSAGE);
      showToast(SUCCESS_MESSAGE, 'success');

      return {
        message: SUCCESS_MESSAGE,
      };
    } catch (requestError) {
      const message =
        requestError instanceof Error && requestError.message.trim() !== ''
          ? requestError.message
          : GENERIC_ERROR_MESSAGE;

      setError(message);
      showToast(message, 'error');

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMessage('');
  }, []);

  return {
    isLoading,
    error,
    successMessage,
    requestPasswordRecovery,
    clearMessages,
  };
}

export default useForgotPassword;
