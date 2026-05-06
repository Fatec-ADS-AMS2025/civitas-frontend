'use client';

import React from 'react';

type FinanceiroErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export default function FinanceiroErrorState({ message, onRetry }: FinanceiroErrorStateProps) {
  return (
    <div className="civitas-card-soft civitas-card-soft--danger flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-[var(--tone-danger-bg)]">
        <svg
          className="h-8 w-8 text-[var(--tone-danger-text)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--tone-danger-text)]">Erro ao carregar dados financeiros</h3>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--tone-danger-text)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="civitas-action civitas-action--danger mt-6 px-6 py-2.5 text-sm font-medium"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
