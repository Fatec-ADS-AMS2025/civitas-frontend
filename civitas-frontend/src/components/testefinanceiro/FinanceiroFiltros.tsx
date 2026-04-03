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
    w-full rounded-lg border border-[#E4EEF0] bg-white px-3 py-2.5
    text-[13px] text-[#1F2A32] placeholder:text-[#9AABB2]
    focus:border-[#004C57] focus:outline-none focus:ring-1 focus:ring-[#004C57]/20
    disabled:cursor-not-allowed disabled:bg-[#F8FCFC] disabled:opacity-60
  `;

  return (
    <div className="rounded-[16px] border border-[#E4EEF0] bg-white p-5">
      {/* Header */}
      <div className="mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D97706]">
          Filtros
        </span>
        <h3 className="mt-1 text-[18px] font-bold text-[#1F2A32]">
          Refinar visão financeira
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-[#9AABB2]">
          Combine período, status e instituição para encontrar rapidamente os registros que importam.
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        {/* Date inputs row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[#6C858E]">
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
            <label className="mb-1 block text-[11px] font-medium text-[#6C858E]">
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
            <label className="mb-1 block text-[11px] font-medium text-[#6C858E]">
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
            <label className="mb-1 block text-[11px] font-medium text-[#6C858E]">
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
            className="rounded-lg bg-[#004C57] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#003942] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar filtros
          </button>
          <button
            onClick={handleClear}
            disabled={loading || !hasActiveFilters}
            className="rounded-lg border border-[#E4EEF0] bg-white px-4 py-2 text-[12px] font-medium text-[#6C858E] transition-colors hover:bg-[#F8FCFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar filtros
          </button>
        </div>

        {/* Active filters section */}
        <div className="border-t border-[#E4EEF0] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D97706]">
            Filtros personalizados ativos
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dataInicio && (
              <span className="rounded-full bg-[#E4EEF0] px-2.5 py-1 text-[10px] font-medium text-[#1F2A32]">
                De: {new Date(dataInicio).toLocaleDateString('pt-BR')}
              </span>
            )}
            {dataFim && (
              <span className="rounded-full bg-[#E4EEF0] px-2.5 py-1 text-[10px] font-medium text-[#1F2A32]">
                Até: {new Date(dataFim).toLocaleDateString('pt-BR')}
              </span>
            )}
            {status && (
              <span className="rounded-full bg-[#E4EEF0] px-2.5 py-1 text-[10px] font-medium text-[#1F2A32]">
                Status: {status === '1' ? 'Ativo' : 'Inativo'}
              </span>
            )}
            {instituicaoId && (
              <span className="rounded-full bg-[#E4EEF0] px-2.5 py-1 text-[10px] font-medium text-[#1F2A32]">
                {instituicoes.find((i) => String(i.id) === instituicaoId)?.nome ?? 'Instituição'}
              </span>
            )}
            {!hasActiveFilters && (
              <span className="text-[11px] text-[#9AABB2]">Nenhum filtro aplicado</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-[#9AABB2]">
            {instituicoes.length} instituições disponíveis
          </p>
        </div>
      </div>
    </div>
  );
}
