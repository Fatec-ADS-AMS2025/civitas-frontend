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
    <section className="financeiro-hero civitas-surface civitas-enter p-5 lg:p-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="financeiro-hero__badge inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            Modulo financeiro
            <span className="h-2 w-2 rounded-full bg-[var(--primary-2)]" />
          </div>

          <h2 className="mt-4 text-[22px] font-semibold leading-tight text-[var(--foreground)] sm:text-[24px] lg:text-[26px]">
            Acompanhamento financeiro consolidado
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--foreground-muted)]">
            Consulte o resumo, aplique filtros e acompanhe as movimentacoes do periodo.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="financeiro-hero__tag inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--foreground)]">
              Ultima atualizacao: {ultimaMovimentacao}
            </span>
            <span className="financeiro-hero__tag inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1.5 text-[11px] font-medium text-[var(--secundary-1)]">
              Filtros ativos: {filtrosAtivos}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="financeiro-hero__stat rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
                Transacoes
              </p>
              <p className="mt-1 text-[24px] font-semibold leading-none text-[var(--foreground)]">
                {resumo?.totalTransacoes ?? 0}
              </p>
            </div>
          </div>

          <div className="financeiro-hero__stat rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
                Instituicoes
              </p>
              <p className="mt-1 text-[24px] font-semibold leading-none text-[var(--foreground)]">
                {instituicoesCount}
              </p>
            </div>
          </div>

          <div className="financeiro-hero__stat rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
                Filtros ativos
              </p>
              <p className="mt-1 text-[24px] font-semibold leading-none text-[var(--foreground)]">
                {filtrosAtivos}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
