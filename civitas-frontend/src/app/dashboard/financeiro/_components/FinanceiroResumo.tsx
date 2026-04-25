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
      <div className="civitas-surface civitas-enter rounded-[20px] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Total de Despesas
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#C9553A]">
          {formatCurrency(totalDespesas)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Saída consolidada das despesas registradas.
        </p>
      </div>

      {/* Total de Orçamentos */}
      <div className="civitas-surface civitas-enter rounded-[20px] p-5" style={{ ["--enter-delay" as string]: "45ms" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Total de Orçamentos
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[var(--secundary-1)]">
          {formatCurrency(totalOrcamentos)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Base financeira disponível para operação.
        </p>
      </div>

      {/* Saldo Atual */}
      <div className="civitas-surface civitas-enter rounded-[20px] p-5" style={{ ["--enter-delay" as string]: "90ms" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Saldo Atual
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[#58AFAE]">
          {formatCurrency(saldo)}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Saldo positivo no painel atual.
        </p>
      </div>

      {/* Movimentações */}
      <div className="civitas-surface civitas-enter rounded-[20px] p-5" style={{ ["--enter-delay" as string]: "135ms" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Movimentações
        </p>
        <p className="mt-2 text-[24px] font-bold leading-none text-[var(--foreground)]">
          {totalTransacoes}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Quantidade total de registros ativos no recorte.
        </p>
      </div>
    </div>
  );
}
