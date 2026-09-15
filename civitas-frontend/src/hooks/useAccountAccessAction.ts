"use client";

import { useCallback, useRef, useState } from "react";
import { showToast } from "@/hooks/useToast";

const GENERIC_ERROR_MESSAGE = "Nao foi possivel concluir a solicitacao agora. Tente novamente em instantes.";

export function useAccountAccessAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const isSubmittingRef = useRef(false);

  const execute = useCallback(async (action: () => Promise<void>, messageOnSuccess: string) => {
    if (isSubmittingRef.current) return false;

    isSubmittingRef.current = true;
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await action();
      setSuccessMessage(messageOnSuccess);
      showToast(messageOnSuccess, "success");
      return true;
    } catch (requestError) {
      const message =
        requestError instanceof Error && requestError.message.trim() !== ""
          ? requestError.message
          : GENERIC_ERROR_MESSAGE;

      setError(message);
      showToast(message, "error");
      return false;
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccessMessage("");
  }, []);

  return {
    isLoading,
    error,
    successMessage,
    execute,
    clearMessages,
  };
}
