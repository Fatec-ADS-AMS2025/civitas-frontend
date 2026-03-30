import React from 'react';
import { FinanceiroResumoDTO } from '@/models/financeiro';

type FinanceiroResumoTesteProps = {
  resumo: FinanceiroResumoDTO | null;
  loading: boolean;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function FinanceiroResumoTeste({ resumo, loading }: FinanceiroResumoTesteProps) {
  if (loading) {
    return <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">Carregando resumo financeiro...</div>;
  }

  if (!resumo) {
    return <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">Sem resumo disponivel.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">
        <p className="text-sm text-[#72808A]">Total de despesas</p>
        <p className="text-xl font-semibold text-[#D14343]">{formatCurrency(resumo.totalDespesas)}</p>
      </div>
      <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">
        <p className="text-sm text-[#72808A]">Total de orcamentos</p>
        <p className="text-xl font-semibold text-[#2E8F63]">{formatCurrency(resumo.totalOrcamentos)}</p>
      </div>
      <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">
        <p className="text-sm text-[#72808A]">Saldo</p>
        <p className="text-xl font-semibold text-[#0B6470]">{formatCurrency(resumo.saldo)}</p>
      </div>
      <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">
        <p className="text-sm text-[#72808A]">Transacoes</p>
        <p className="text-xl font-semibold text-[#1F2A32]">{resumo.totalTransacoes}</p>
      </div>
    </div>
  );
}
