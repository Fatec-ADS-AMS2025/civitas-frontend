"use client";

import { useCallback } from "react";
import { accountAccessService } from "@/hooks/accountAccessService";
import { useAccountAccessAction } from "@/hooks/useAccountAccessAction";

type ForgotPasswordInput = {
  email: string;
};

const SUCCESS_MESSAGE = "Se este e-mail estiver cadastrado, as instrucoes de recuperacao serao enviadas.";

export function useForgotPassword() {
  const { isLoading, error, successMessage, execute, clearMessages } = useAccountAccessAction();

  const requestPasswordRecovery = useCallback(
    ({ email }: ForgotPasswordInput) =>
      execute(
        () => accountAccessService.requestPasswordRecovery({ email: email.trim().toLowerCase() }),
        SUCCESS_MESSAGE,
      ),
    [execute],
  );

  return {
    isLoading,
    error,
    successMessage,
    requestPasswordRecovery,
    clearMessages,
  };
}

export default useForgotPassword;
