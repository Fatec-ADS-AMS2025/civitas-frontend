'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ExportModal from '@/components/Table/export-modal';
import {
  exportTableData,
  getSelectedColumns,
} from '@/components/Table/export-utils';
import type {
  TableColumn,
  TableExportOptions,
} from '@/components/Table/export-types';
import { FinanceiroTransacaoDTO } from '@/models/financeiro';
import { getSituacaoLabel, SITUACAO_ATIVO } from '@/global/situacao';
import { showToast } from '@/hooks/useToast';
import FinanceiroEmptyState from './FinanceiroEmptyState';

type FinanceiroListaProps = {
  transacoes: FinanceiroTransacaoDTO[];
  allTransacoes?: FinanceiroTransacaoDTO[];
  hasFiltersApplied?: boolean;
  onEdit?: (transacao: FinanceiroTransacaoDTO) => void;
  onDelete: (id: number, tipo: 'despesa' | 'orcamento') => Promise<void>;
  onAlterarStatus?: (id: number, tipo: 'despesa' | 'orcamento') => Promise<void>;
  loading?: boolean;
};

type FinanceiroExportRow = {
  id: number;
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  situacao?: number;
};

const FINANCEIRO_EXPORT_COLUMNS: TableColumn[] = [
  { id: 'id', label: 'Registro' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'descricao', label: 'Descricao' },
  { id: 'valor', label: 'Valor' },
  { id: 'data', label: 'Data' },
  { id: 'situacao', label: 'Situacao' },
];

const FINANCEIRO_EXPORT_TITLE = 'Listagem de transacoes';
const FINANCEIRO_EXPORT_FILE_NAME = 'financeiro';

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

function TipoBadge({ tipo }: { tipo: 'despesa' | 'orcamento' }) {
  const isDespesa = tipo === 'despesa';
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-semibold ${
        isDespesa ? 'bg-[#FFF1F1] text-[#C55A5A]' : 'bg-[#EEF9F1] text-[#16714A]'
      }`}
    >
      {isDespesa ? 'Despesa' : 'Orcamento'}
    </span>
  );
}

function StatusBadge({ situacao }: { situacao?: number }) {
  const isAtivo = situacao === SITUACAO_ATIVO;
  const label = getSituacaoLabel(situacao);

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-semibold ${
        isAtivo
          ? 'bg-[var(--status-active-bg)] text-[var(--status-active-text)]'
          : 'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]'
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-sm ${
          isAtivo ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
}

export default function FinanceiroLista({
  transacoes,
  allTransacoes = transacoes,
  hasFiltersApplied = false,
  onEdit,
  onDelete,
  onAlterarStatus,
  loading = false,
}: FinanceiroListaProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const despesas = transacoes.filter((t) => t.tipo === 'despesa');
  const orcamentos = transacoes.filter((t) => t.tipo === 'orcamento');

  const mapTransacaoToExportRow = useCallback(
    (transacao: FinanceiroTransacaoDTO): FinanceiroExportRow => ({
      id: transacao.id,
      tipo: transacao.tipo === 'despesa' ? 'Despesa' : 'Orcamento',
      descricao: transacao.descricao,
      valor: formatCurrency(transacao.valor),
      data: formatDate(transacao.data),
      situacao: transacao.situacao,
    }),
    []
  );

  const filteredExportRows = useMemo(
    () => transacoes.map(mapTransacaoToExportRow),
    [mapTransacaoToExportRow, transacoes]
  );

  const allExportRows = useMemo(
    () => allTransacoes.map(mapTransacaoToExportRow),
    [allTransacoes, mapTransacaoToExportRow]
  );

  const handleExport = useCallback(
    async ({ outputType, scope, selectedColumnIds }: TableExportOptions) => {
      const rows = scope === 'all' ? allExportRows : filteredExportRows;
      const selectedColumns = getSelectedColumns(FINANCEIRO_EXPORT_COLUMNS, selectedColumnIds);

      try {
        setIsExporting(true);

        await exportTableData({
          outputType,
          title: FINANCEIRO_EXPORT_TITLE,
          fileName: FINANCEIRO_EXPORT_FILE_NAME,
          rows,
          columns: selectedColumns,
        });

        showToast('Arquivo gerado com sucesso.', 'success');
        setIsExportModalOpen(false);
      } catch (error) {
        console.error('Erro ao exportar listagem financeira.', error);
        showToast('Nao foi possivel gerar o arquivo. Tente novamente.', 'error');
      } finally {
        setIsExporting(false);
      }
    },
    [allExportRows, filteredExportRows]
  );

  const handleDelete = useCallback(
    async (id: number, tipo: 'despesa' | 'orcamento') => {
      setProcessingId(id);
      try {
        await onDelete(id, tipo);
        showToast(`${tipo === 'despesa' ? 'Despesa' : 'Orcamento'} processado com sucesso.`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao processar exclusao.';
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
        title={hasFiltersApplied ? 'Nenhum resultado encontrado' : 'Nenhuma transacao cadastrada'}
        description={
          hasFiltersApplied
            ? 'Nao encontramos transacoes com os filtros aplicados.'
            : 'Cadastre despesas ou orcamentos para visualizar os registros.'
        }
      />
    );
  }

  return (
    <div className="civitas-surface civitas-enter p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
            Monitoramento
          </span>
          <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Listagem de transacoes
          </h3>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Consulta de tipo, valor, data e situacao.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-soft)]">Total</p>
            <p className="text-lg font-semibold text-[var(--foreground)]">{transacoes.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-soft)]">Despesas</p>
            <p className="text-lg font-semibold text-[#D97706]">{despesas.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--foreground-soft)]">Orcamentos</p>
            <p className="text-lg font-semibold text-[var(--secundary-1)]">{orcamentos.length}</p>
          </div>
        </div>
      </div>

      {allExportRows.length > 0 ? (
        <div className="flex flex-col gap-3 border-b border-[#E4EEF0] pb-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
          >
            <span className="material-symbols-outlined text-base text-[var(--foreground)]">print</span>
            Exportar / Imprimir
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--divider)]">
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Registro
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Tipo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Descricao
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Valor
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Data
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Situacao
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Acao
              </th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((transacao, index) => {
              const isProcessing = processingId === transacao.id || loading;

              return (
                <tr
                  key={`${transacao.tipo}-${transacao.id}`}
                  style={
                    index < 6
                      ? ({ ['--enter-delay' as string]: `${index * 45}ms` } as React.CSSProperties)
                      : undefined
                  }
                  className={`${index < 6 ? 'civitas-enter ' : ''}group border-b border-[#EEF4F5] transition-all duration-[var(--motion-duration-fast)] last:border-0 hover:bg-[#F8FCFC]`}
                >
                  <td className="px-3 py-3">
                    <span className="text-sm font-medium text-[var(--foreground-soft)]">
                      #{transacao.id}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <TipoBadge tipo={transacao.tipo} />
                  </td>
                  <td className="max-w-[200px] px-3 py-3">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
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
                    <span className="text-sm text-[var(--foreground-muted)]">
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
                          type="button"
                          onClick={() => void handleAlterarStatus(transacao.id, transacao.tipo)}
                          disabled={isProcessing}
                          className="civitas-action civitas-action--ghost min-h-[34px] rounded-sm px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? '...' : 'Alterar status'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(transacao.id, transacao.tipo)}
                        disabled={isProcessing}
                        className="inline-flex min-h-[34px] items-center justify-center rounded-sm border border-[#F1D7D7] bg-[#FFF4F4] px-3 py-1.5 text-xs font-medium text-[#C45F5F] transition-all duration-[var(--motion-duration-fast)] hover:bg-[#FFECEC] disabled:cursor-not-allowed disabled:opacity-50"
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

      {allExportRows.length > 0 ? (
        <ExportModal
          open={isExportModalOpen}
          title={FINANCEIRO_EXPORT_TITLE}
          columns={FINANCEIRO_EXPORT_COLUMNS}
          filteredCount={filteredExportRows.length}
          allCount={allExportRows.length}
          isGenerating={isExporting}
          onClose={() => setIsExportModalOpen(false)}
          onGenerate={handleExport}
        />
      ) : null}
    </div>
  );
}
