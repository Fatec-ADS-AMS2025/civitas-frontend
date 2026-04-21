'use client';

import React from 'react';

export default function FinanceiroLoadingState() {
  return (
    <div className="skeleton-loader space-y-6">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#E4EEF0] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="skeleton-line h-6 w-32 rounded-full" />
            <div className="skeleton-line mt-4 h-10 w-3/4 rounded-lg" />
            <div className="skeleton-line mt-3 h-5 w-1/2 rounded" />
            <div className="mt-4 flex gap-2">
              <div className="skeleton-line h-7 w-44 rounded-full" />
              <div className="skeleton-line h-7 w-40 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#F8FCFC] p-3">
                <div className="skeleton-line h-4 w-32 rounded" />
                <div className="skeleton-line h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
            <div className="skeleton-line h-3 w-24 rounded" />
            <div className="skeleton-line mt-3 h-8 w-32 rounded" />
            <div className="skeleton-line mt-2 h-3 w-40 rounded" />
          </div>
        ))}
      </div>

      {/* Filtros e Cadastro skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div className="skeleton-line h-5 w-20 rounded" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-line h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div className="skeleton-line h-5 w-20 rounded" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-line h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabela skeleton */}
      <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
        <div className="skeleton-line h-5 w-40 rounded" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-[#F8FCFC] p-4">
              <div className="skeleton-line h-4 w-12 rounded" />
              <div className="skeleton-line h-4 w-20 rounded" />
              <div className="skeleton-line h-4 w-40 flex-1 rounded" />
              <div className="skeleton-line h-4 w-24 rounded" />
              <div className="skeleton-line h-4 w-24 rounded" />
              <div className="skeleton-line h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
