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
    w-full rounded-[16px] border border-[var(--border-default)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5
    text-[13px] text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]
    shadow-[var(--shadow-xs)] focus:border-[var(--secundary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]
    disabled:cursor-not-allowed disabled:bg-[#F8FCFC] disabled:opacity-60
  `;

  return (
    <div className="civitas-surface civitas-enter rounded-[20px] p-5">
      {/* Header */}
      <div className="civitas-panel-header mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D97706]">
          Filtros
        </span>
        <h3 className="mt-1 text-[18px] font-bold text-[var(--foreground)]">
          Refinar visão financeira
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--foreground-soft)]">
          Combine período, status e instituição para encontrar rapidamente os registros que importam.
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        {/* Date inputs row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Início do período
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                disabled={loading}
                placeholder="03/01/2026"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Fim do período
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                disabled={loading}
                placeholder="03/24/2026"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Status and Institution row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="">Ativo</option>
              <option value="1">Ativo</option>
              <option value="2">Inativo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[var(--foreground-muted)]">
              Instituição
            </label>
            <select
              value={instituicaoId}
              onChange={(e) => setInstituicaoId(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="">Secretaria de Educação</option>
              {instituicoes.map((inst) => (
                <option key={inst.id} value={String(inst.id)}>
                  {inst.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleApply}
            disabled={loading}
            className="civitas-action civitas-action--primary min-h-[38px] rounded-[14px] px-4 py-2 text-[12px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar filtros
          </button>
          <button
            onClick={handleClear}
            disabled={loading || !hasActiveFilters}
            className="civitas-action civitas-action--ghost min-h-[38px] rounded-[14px] px-4 py-2 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar filtros
          </button>
        </div>

        {/* Active filters section */}
        <div className="border-t border-[var(--divider)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D97706]">
            Filtros personalizados ativos
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dataInicio && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                De: {new Date(dataInicio).toLocaleDateString('pt-BR')}
              </span>
            )}
            {dataFim && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                Até: {new Date(dataFim).toLocaleDateString('pt-BR')}
              </span>
            )}
            {status && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                Status: {status === '1' ? 'Ativo' : 'Inativo'}
              </span>
            )}
            {instituicaoId && (
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--foreground)]">
                {instituicoes.find((i) => String(i.id) === instituicaoId)?.nome ?? 'Instituição'}
              </span>
            )}
            {!hasActiveFilters && (
              <span className="text-[11px] text-[var(--foreground-soft)]">Nenhum filtro aplicado</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-[var(--foreground-soft)]">
            {instituicoes.length} instituições disponíveis
          </p>
        </div>
      </div>
    </div>
  );
}
