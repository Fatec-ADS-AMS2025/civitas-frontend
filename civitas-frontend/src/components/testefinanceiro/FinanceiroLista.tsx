'use client';

import React, { useState, useCallback } from 'react';
import { FinanceiroTransacaoDTO } from '@/models/financeiro';
import { getSituacaoLabel, SITUACAO_ATIVO } from '@/global/situacao';
import { showToast } from '@/hooks/useToast';
import FinanceiroEmptyState from './FinanceiroEmptyState';

type FinanceiroListaProps = {
  transacoes: FinanceiroTransacaoDTO[];
  hasFiltersApplied?: boolean;
  onEdit?: (transacao: FinanceiroTransacaoDTO) => void;
  onDelete: (id: number, tipo: 'despesa' | 'orcamento') => Promise<void>;
  onAlterarStatus?: (id: number, tipo: 'despesa' | 'orcamento') => Promise<void>;
  loading?: boolean;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

type TipoBadgeProps = {
  tipo: 'despesa' | 'orcamento';
};

function TipoBadge({ tipo }: TipoBadgeProps) {
  const isDespesa = tipo === 'despesa';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        isDespesa
          ? 'bg-red-50 text-red-700'
          : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {isDespesa ? 'Despesa' : 'Orçamento'}
    </span>
  );
}

type StatusBadgeProps = {
  situacao?: number;
};

function StatusBadge({ situacao }: StatusBadgeProps) {
  const isAtivo = situacao === SITUACAO_ATIVO;
  const label = getSituacaoLabel(situacao);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isAtivo
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          isAtivo ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
}

export default function FinanceiroLista({
  transacoes,
  hasFiltersApplied = false,
  onEdit,
  onDelete,
  onAlterarStatus,
  loading = false,
}: FinanceiroListaProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const despesas = transacoes.filter((t) => t.tipo === 'despesa');
  const orcamentos = transacoes.filter((t) => t.tipo === 'orcamento');

  const handleDelete = useCallback(
    async (id: number, tipo: 'despesa' | 'orcamento') => {
      setProcessingId(id);
      try {
        await onDelete(id, tipo);
        showToast(`${tipo === 'despesa' ? 'Despesa' : 'Orçamento'} ${tipo === 'despesa' ? 'inativado' : 'excluído'} com sucesso.`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao processar exclusão.';
        showToast(message, 'error');
      } finally {
        setProcessingId(null);
      }
    },
    [onDelete]
  );

  const handleAlterarStatus = useCallback(
    async (id: number, tipo: 'despesa' | 'orcamento') => {
      if (!onAlterarStatus) return;
      setProcessingId(id);
      try {
        await onAlterarStatus(id, tipo);
        showToast('Status alterado com sucesso.', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao alterar status.';
        showToast(message, 'error');
      } finally {
        setProcessingId(null);
      }
    },
    [onAlterarStatus]
  );

  if (transacoes.length === 0) {
    return (
      <FinanceiroEmptyState
        showFiltersMessage={hasFiltersApplied}
        title={hasFiltersApplied ? 'Nenhum resultado encontrado' : 'Nenhuma transação cadastrada'}
        description={
          hasFiltersApplied
            ? 'Não encontramos transações com os filtros aplicados.'
            : 'Cadastre despesas ou orçamentos para começar a visualizar suas transações.'
        }
      />
    );
  }

  return (
    <div className="rounded-[20px] border border-[#E4EEF0] bg-white p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#D97706]">
            Monitoramento
          </span>
          <h3 className="mt-1 text-lg font-semibold text-[#1F2A32]">
            Listagem de transações
          </h3>
          <p className="mt-0.5 text-xs text-[#72808A]">
            Painel com leitura rápida do tipo, valor, data e situação de cada movimentação.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6C858E]">Total</p>
            <p className="text-xl font-bold text-[#1F2A32]">{transacoes.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6C858E]">Despesas</p>
            <p className="text-xl font-bold text-[#D97706]">{despesas.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6C858E]">Orçamentos</p>
            <p className="text-xl font-bold text-[#004C57]">{orcamentos.length}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#E4EEF0]">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Registro
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Tipo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Descrição
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Valor
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Data
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Situação
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6C858E]">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((transacao) => {
              const isProcessing = processingId === transacao.id || loading;

              return (
                <tr
                  key={`${transacao.tipo}-${transacao.id}`}
                  className="group border-b border-[#F1F5F5] transition-colors last:border-0 hover:bg-[#F8FCFC]"
                >
                  <td className="px-3 py-3">
                    <span className="text-sm font-medium text-[#6C858E]">
                      #{transacao.id}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <TipoBadge tipo={transacao.tipo} />
                  </td>
                  <td className="max-w-[200px] px-3 py-3">
                    <p className="truncate text-sm font-medium text-[#1F2A32]">
                      {transacao.descricao}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        transacao.tipo === 'despesa' ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(transacao.valor)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-[#72808A]">
                      {formatDate(transacao.data)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge situacao={transacao.situacao} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {onAlterarStatus && (
                        <button
                          onClick={() => void handleAlterarStatus(transacao.id, transacao.tipo)}
                          disabled={isProcessing}
                          className="rounded-lg bg-[#004C57] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#003942] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? '...' : 'Alterar status'}
                        </button>
                      )}
                      <button
                        onClick={() => void handleDelete(transacao.id, transacao.tipo)}
                        disabled={isProcessing}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? '...' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
