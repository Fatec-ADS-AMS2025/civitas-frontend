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
      <div className="civitas-surface civitas-enter p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Total de despesas
        </p>
        <p className="mt-2 text-[22px] font-semibold leading-none text-[var(--tone-danger-text)]">
          {formatCurrency(totalDespesas)}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Saida consolidada do periodo.
        </p>
      </div>

      <div className="civitas-surface civitas-enter p-4" style={{ ['--enter-delay' as string]: '45ms' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Total de orcamentos
        </p>
        <p className="mt-2 text-[22px] font-semibold leading-none text-[var(--secundary-1)]">
          {formatCurrency(totalOrcamentos)}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Base financeira disponivel.
        </p>
      </div>

      <div className="civitas-surface civitas-enter p-4" style={{ ['--enter-delay' as string]: '90ms' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Saldo atual
        </p>
        <p className="mt-2 text-[22px] font-semibold leading-none text-[var(--tone-teal-text)]">
          {formatCurrency(saldo)}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Diferenca entre entradas e saidas.
        </p>
      </div>

      <div className="civitas-surface civitas-enter p-4" style={{ ['--enter-delay' as string]: '135ms' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
          Movimentacoes
        </p>
        <p className="mt-2 text-[22px] font-semibold leading-none text-[var(--foreground)]">
          {totalTransacoes}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--foreground-soft)]">
          Registros no recorte atual.
        </p>
      </div>
    </div>
  );
}
