'use client';

import React from 'react';

export default function FinanceiroLoadingState() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#E4EEF0] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-6 w-32 animate-pulse rounded-full bg-[#E4EEF0]" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded-lg bg-[#E4EEF0]" />
            <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-[#E4EEF0]" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-44 animate-pulse rounded-full bg-[#E4EEF0]" />
              <div className="h-7 w-40 animate-pulse rounded-full bg-[#E4EEF0]" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#F8FCFC] p-3">
                <div className="h-4 w-32 animate-pulse rounded bg-[#E4EEF0]" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-[#E4EEF0]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
            <div className="h-3 w-24 animate-pulse rounded bg-[#E4EEF0]" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-[#E4EEF0]" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[#E4EEF0]" />
          </div>
        ))}
      </div>

      {/* Filtros e Cadastro skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div className="h-5 w-20 animate-pulse rounded bg-[#E4EEF0]" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-[#E4EEF0]" />
            ))}
          </div>
        </div>
        <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div className="h-5 w-20 animate-pulse rounded bg-[#E4EEF0]" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-[#E4EEF0]" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabela skeleton */}
      <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
        <div className="h-5 w-40 animate-pulse rounded bg-[#E4EEF0]" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-[#F8FCFC] p-4">
              <div className="h-4 w-12 animate-pulse rounded bg-[#E4EEF0]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#E4EEF0]" />
              <div className="h-4 w-40 flex-1 animate-pulse rounded bg-[#E4EEF0]" />
              <div className="h-4 w-24 animate-pulse rounded bg-[#E4EEF0]" />
              <div className="h-4 w-24 animate-pulse rounded bg-[#E4EEF0]" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-[#E4EEF0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
