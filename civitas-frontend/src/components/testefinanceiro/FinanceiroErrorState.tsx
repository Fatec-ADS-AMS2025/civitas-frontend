'use client';

import React from 'react';

type FinanceiroErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export default function FinanceiroErrorState({ message, onRetry }: FinanceiroErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-red-200 bg-red-50 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-600"
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
      <h3 className="mt-4 text-lg font-semibold text-red-800">Erro ao carregar dados financeiros</h3>
      <p className="mt-2 max-w-md text-center text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
