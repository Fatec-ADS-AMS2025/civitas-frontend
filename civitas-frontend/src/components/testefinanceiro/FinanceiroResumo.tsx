'use client';

import React from 'react';
import { FinanceiroResumoDTO } from '@/models/financeiro';

type FinanceiroResumoProps = {
  resumo: FinanceiroResumoDTO | null;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function FinanceiroResumo({ resumo }: FinanceiroResumoProps) {
  const totalDespesas = resumo?.totalDespesas ?? 0;
  const totalOrcamentos = resumo?.totalOrcamentos ?? 0;
  const saldo = resumo?.saldo ?? 0;
  const totalTransacoes = resumo?.totalTransacoes ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total de Despesas */}
      <div className="rounded-[16px] border border-[#E4EEF0] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
          Total de Despesas
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#C9553A]">
          {formatCurrency(totalDespesas)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[#9AABB2]">
          Saída consolidada das despesas registradas.
        </p>
      </div>

      {/* Total de Orçamentos */}
      <div className="rounded-[16px] border border-[#E4EEF0] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
          Total de Orçamentos
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#004C57]">
          {formatCurrency(totalOrcamentos)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[#9AABB2]">
          Base financeira disponível para operação.
        </p>
      </div>

      {/* Saldo Atual */}
      <div className="rounded-[16px] border border-[#E4EEF0] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
          Saldo Atual
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#58AFAE]">
          {formatCurrency(saldo)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[#9AABB2]">
          Saldo positivo no painel atual.
        </p>
      </div>

      {/* Movimentações */}
      <div className="rounded-[16px] border border-[#E4EEF0] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
          Movimentações
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#1F2A32]">
          {totalTransacoes}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[#9AABB2]">
          Quantidade total de registros ativos no recorte.
        </p>
      </div>
    </div>
  );
}
