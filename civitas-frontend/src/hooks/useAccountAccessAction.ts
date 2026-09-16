"use client";

import { useCallback, useRef, useState } from "react";
import { showToast } from "@/hooks/useToast";

const GENERIC_ERROR_MESSAGE = "Não foi possível concluir a solicitação agora. Tente novamente em instantes.";

type ExecuteOptions = {
  suppressError?: (error: unknown) => boolean;
};

export function useAccountAccessAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const isSubmittingRef = useRef(false);

  const execute = useCallback(
    async (action: () => Promise<void>, messageOnSuccess: string, options?: ExecuteOptions) => {
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
        if (options?.suppressError?.(requestError)) return false;

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
    },
    [],
  );

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
