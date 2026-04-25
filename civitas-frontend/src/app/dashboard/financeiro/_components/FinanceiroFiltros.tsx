'use client';

import React, { useState, useCallback } from 'react';
import { FinanceiroFiltrosDTO } from '@/models/financeiro';
import InstituicaoDTO from '@/models/instituicao';

type FinanceiroFiltrosProps = {
  instituicoes: InstituicaoDTO[];
  filtrosAtuais: FinanceiroFiltrosDTO;
  onApply: (filters: Partial<FinanceiroFiltrosDTO>) => void;
  loading?: boolean;
};

export default function FinanceiroFiltros({
  instituicoes,
  filtrosAtuais,
  onApply,
  loading = false,
}: FinanceiroFiltrosProps) {
  const [dataInicio, setDataInicio] = useState(filtrosAtuais.dataInicio ?? '');
  const [dataFim, setDataFim] = useState(filtrosAtuais.dataFim ?? '');
  const [status, setStatus] = useState(filtrosAtuais.status?.toString() ?? '');
  const [instituicaoId, setInstituicaoId] = useState(filtrosAtuais.instituicaoId?.toString() ?? '');

  const hasActiveFilters = dataInicio || dataFim || status || instituicaoId;

  const handleApply = useCallback(() => {
    onApply({
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      status: status ? Number(status) : undefined,
      instituicaoId: instituicaoId ? Number(instituicaoId) : undefined,
    });
  }, [dataInicio, dataFim, status, instituicaoId, onApply]);

  const handleClear = useCallback(() => {
    setDataInicio('');
    setDataFim('');
    setStatus('');
    setInstituicaoId('');
    onApply({
      dataInicio: undefined,
      dataFim: undefined,
      status: undefined,
      instituicaoId: undefined,
    });
  }, [onApply]);

  const inputClass = `
    w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5
    text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]
    focus:border-[var(--secundary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]
    disabled:cursor-not-allowed disabled:bg-[#F8FCFC] disabled:opacity-60
  `;

  return (
    <div className="civitas-surface civitas-enter p-5">
      <div className="civitas-panel-header mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B5B00]">
          Filtros
        </span>
        <h3 className="mt-1 text-[18px] font-semibold text-[var(--foreground)]">
          Consultar registros
        </h3>
        <p className="mt-1 text-sm text-[var(--foreground-soft)]">
          Selecione periodo, situacao e instituicao.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Inicio do periodo
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Fim do periodo
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Situacao
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="">Todas</option>
              <option value="1">Ativo</option>
              <option value="2">Inativo</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Instituicao
            </label>
            <select
              value={instituicaoId}
              onChange={(e) => setInstituicaoId(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="">Todas</option>
              {instituicoes.map((inst) => (
                <option key={inst.id} value={String(inst.id)}>
                  {inst.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="civitas-action civitas-action--primary min-h-[40px] rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || !hasActiveFilters}
            className="civitas-action civitas-action--ghost min-h-[40px] rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar
          </button>
        </div>

        <div className="border-t border-[var(--divider)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
            Filtros ativos
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dataInicio && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                De: {new Date(dataInicio).toLocaleDateString('pt-BR')}
              </span>
            )}
            {dataFim && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                Ate: {new Date(dataFim).toLocaleDateString('pt-BR')}
              </span>
            )}
            {status && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                Situacao: {status === '1' ? 'Ativo' : 'Inativo'}
              </span>
            )}
            {instituicaoId && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                {instituicoes.find((i) => String(i.id) === instituicaoId)?.nome ?? 'Instituicao'}
              </span>
            )}
            {!hasActiveFilters && (
              <span className="text-[11px] text-[var(--foreground-soft)]">Nenhum filtro aplicado</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-[var(--foreground-soft)]">
            {instituicoes.length} instituicoes disponiveis
          </p>
        </div>
      </div>
    </div>
  );
}
