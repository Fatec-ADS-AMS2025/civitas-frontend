import React from 'react';
import { FinanceiroTransacaoDTO } from '@/models/financeiro';

type FinanceiroListaTesteProps = {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  transacoes: FinanceiroTransacaoDTO[];
  onDelete: (id: number, tipo: 'despesa' | 'orcamento') => Promise<void>;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function FinanceiroListaTeste({
  loading,
  error,
  hasData,
  transacoes,
  onDelete,
}: FinanceiroListaTesteProps) {
  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4">Carregando transações...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
  }

  if (!hasData) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4">Nenhum dado financeiro encontrado.</div>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Listagem de transações</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Tipo</th>
              <th className="px-2 py-2">Descrição</th>
              <th className="px-2 py-2">Valor</th>
              <th className="px-2 py-2">Data</th>
              <th className="px-2 py-2">Situação</th>
              <th className="px-2 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((item) => (
              <tr key={`${item.tipo}-${item.id}`} className="border-b border-gray-100">
                <td className="px-2 py-2">{item.id}</td>
                <td className="px-2 py-2">{item.tipo}</td>
                <td className="px-2 py-2">{item.descricao}</td>
                <td className="px-2 py-2">{formatCurrency(item.valor)}</td>
                <td className="px-2 py-2">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                <td className="px-2 py-2">{item.situacao ?? '-'}</td>
                <td className="px-2 py-2">
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white"
                    onClick={() => void onDelete(item.id, item.tipo)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
