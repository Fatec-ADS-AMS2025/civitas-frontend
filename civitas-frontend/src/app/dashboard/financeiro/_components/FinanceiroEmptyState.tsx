'use client';

import React from 'react';

type FinanceiroEmptyStateProps = {
  title?: string;
  description?: string;
  showFiltersMessage?: boolean;
};

export default function FinanceiroEmptyState({
  title = 'Nenhuma transação encontrada',
  description = 'Não há dados financeiros para exibir no momento.',
  showFiltersMessage = false,
}: FinanceiroEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[20px] border border-[#E4EEF0] bg-[#F8FCFC] p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E4EEF0]">
        <svg
          className="h-8 w-8 text-[#6C858E]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1F2A32]">{title}</h3>
      <p className="mt-2 max-w-md text-center text-sm text-[#72808A]">{description}</p>
      {showFiltersMessage && (
        <p className="mt-3 text-sm text-[#58AFAE]">
          Tente ajustar os filtros ou limpar a busca para ver mais resultados.
        </p>
      )}
    </div>
  );
}
