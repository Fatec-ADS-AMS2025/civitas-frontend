'use client';

import React from 'react';
import { FinanceiroResumoDTO, FinanceiroFiltrosDTO } from '@/models/financeiro';

type FinanceiroHeroProps = {
  resumo: FinanceiroResumoDTO | null;
  filtros: FinanceiroFiltrosDTO;
  instituicoesCount: number;
};

const formatDateBR = (): string => {
  return new Date().toLocaleDateString('pt-BR');
};

const countActiveFiltros = (filtros: FinanceiroFiltrosDTO): number => {
  let count = 0;
  if (filtros.dataInicio) count++;
  if (filtros.dataFim) count++;
  if (filtros.status !== undefined && filtros.status !== null) count++;
  if (filtros.instituicaoId) count++;
  return count;
};

export default function FinanceiroHero({ resumo, filtros, instituicoesCount }: FinanceiroHeroProps) {
  const filtrosAtivos = countActiveFiltros(filtros);
  const ultimaMovimentacao = formatDateBR();

  return (
    <section className="financeiro-hero civitas-enter relative overflow-hidden rounded-[28px] border border-[#DCE8EA] bg-gradient-to-br from-[#F1F8F9] via-[#F8FCFC] to-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.05)] lg:p-8">
      {/* Decorative circles */}
      <div className="financeiro-hero__decor absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#E4EEF0] opacity-40" />
      <div className="financeiro-hero__decor absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#58AFAE] opacity-10" />

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Left content */}
        <div>
          {/* Badge */}
          <div className="financeiro-hero__badge inline-flex items-center gap-2 rounded-full border border-[#DCEBED] bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6C858E] backdrop-blur-sm">
            Módulo Financeiro
            <span className="h-2 w-2 rounded-full bg-[#D97706]" />
          </div>

          {/* Title */}
          <h2 className="mt-5 text-[28px] font-bold leading-[1.15] tracking-tight text-[#1F2A32] sm:text-[32px] lg:text-[36px]">
            Leia o pulso financeiro do sistema,
            conecte filtros ativos e acompanhe as movimentações mais recentes.
          </h2>

          {/* Subtitle */}
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#72808A]">
            Visualize o resumo financeiro, aplique filtros e gerencie lançamentos com mais clareza no dia a dia.
          </p>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="financeiro-hero__tag inline-flex items-center gap-1.5 rounded-full bg-[#E4EEF0] px-3 py-1.5 text-[11px] font-medium text-[#1F2A32]">
              <svg className="h-3.5 w-3.5 text-[#58AFAE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Última movimentação: {ultimaMovimentacao}
            </span>
            <span className="financeiro-hero__tag inline-flex items-center gap-1.5 rounded-full bg-[#004C57] px-3 py-1.5 text-[11px] font-semibold text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Painel financeiro atualizado
            </span>
          </div>
        </div>

        {/* Right indicators */}
        <div className="flex flex-col gap-3">
          {/* Card 1 - Transações monitoradas */}
          <div className="financeiro-hero__stat flex items-center justify-between rounded-xl border border-[#E4EEF0] bg-white p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
                Transações monitoradas
              </p>
              <p className="mt-1 text-[28px] font-bold leading-none text-[#1F2A32]">
                {resumo?.totalTransacoes ?? 0}
              </p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#004C57] text-[10px] font-bold text-white">
              01
            </span>
          </div>

          {/* Card 2 - Instituições conectadas */}
          <div className="financeiro-hero__stat flex items-center justify-between rounded-xl border border-[#E4EEF0] bg-white p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
                Instituições conectadas
              </p>
              <p className="mt-1 text-[28px] font-bold leading-none text-[#1F2A32]">
                {instituicoesCount}
              </p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#004C57] text-[10px] font-bold text-white">
              02
            </span>
          </div>

          {/* Card 3 - Filtros ativos */}
          <div className="financeiro-hero__stat flex items-center justify-between rounded-xl border border-[#E4EEF0] bg-white p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6C858E]">
                Filtros ativos
              </p>
              <p className="mt-1 text-[28px] font-bold leading-none text-[#1F2A32]">
                {filtrosAtivos}
              </p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#004C57] text-[10px] font-bold text-white">
              03
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
