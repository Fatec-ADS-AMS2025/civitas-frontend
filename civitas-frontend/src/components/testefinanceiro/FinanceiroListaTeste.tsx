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
    return <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">Carregando transacoes...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
  }

  if (!hasData) {
    return <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">Nenhum dado financeiro encontrado.</div>;
  }

  return (
    <div className="rounded-2xl border border-[#E4EEF0] bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-[#1F2A32]">Listagem de transacoes</h2>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[760px] w-full text-left text-sm text-[#33434D]">
          <thead>
            <tr className="border-b border-[#E4EEF0] text-[#7D8B94]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Descricao</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Situacao</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((item) => (
              <tr key={`${item.tipo}-${item.id}`} className="border-b border-[#EEF2F4]">
                <td className="px-3 py-3">{item.id}</td>
                <td className="px-3 py-3 capitalize">{item.tipo}</td>
                <td className="px-3 py-3">{item.descricao}</td>
                <td className="px-3 py-3">{formatCurrency(item.valor)}</td>
                <td className="px-3 py-3">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                <td className="px-3 py-3">{item.situacao ?? '-'}</td>
                <td className="px-3 py-3">
                  <button
                    className="rounded-xl bg-[#D14343] px-3 py-2 text-white transition hover:brightness-95"
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

      <div className="space-y-3 md:hidden">
        {transacoes.map((item) => (
          <article key={`${item.tipo}-${item.id}`} className="rounded-2xl border border-[#E4EEF0] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8FA0A8]">ID / Tipo</p>
                <p className="text-sm font-semibold text-[#1F2A32]">
                  {item.id} - <span className="capitalize">{item.tipo}</span>
                </p>
              </div>
              <span className="rounded-full bg-[#F3F9FA] px-3 py-1 text-xs font-semibold text-[#0B6470]">
                {item.situacao ?? '-'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-[#33434D]">
              <p><strong>Descricao:</strong> {item.descricao}</p>
              <p><strong>Valor:</strong> {formatCurrency(item.valor)}</p>
              <p><strong>Data:</strong> {new Date(item.data).toLocaleDateString('pt-BR')}</p>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-[#D14343] px-3 py-2 font-semibold text-white transition hover:brightness-95"
              onClick={() => void onDelete(item.id, item.tipo)}
            >
              Excluir
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
