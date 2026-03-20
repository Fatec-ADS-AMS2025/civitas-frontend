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
    return <div className="rounded-lg border border-gray-200 bg-white p-4">Carregando resumo financeiro...</div>;
  }

  if (!resumo) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4">Sem resumo disponível.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Total de Despesas</p>
        <p className="text-xl font-semibold text-red-700">{formatCurrency(resumo.totalDespesas)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Total de Orçamentos</p>
        <p className="text-xl font-semibold text-emerald-700">{formatCurrency(resumo.totalOrcamentos)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Saldo</p>
        <p className="text-xl font-semibold text-blue-700">{formatCurrency(resumo.saldo)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Transações</p>
        <p className="text-xl font-semibold text-gray-900">{resumo.totalTransacoes}</p>
      </div>
    </div>
  );
}
