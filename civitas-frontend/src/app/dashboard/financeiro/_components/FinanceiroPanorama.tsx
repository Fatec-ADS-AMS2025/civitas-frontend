'use client';

import React, { useMemo, useState } from 'react';
import type { FinanceiroPanoramaDTO } from '@/models/financeiro';

type FinanceiroPanoramaProps = {
  panorama: FinanceiroPanoramaDTO;
};

type TabKey = 'secretarias' | 'instituicoes' | 'unidades';

const TAB_LABELS: Record<TabKey, string> = {
  secretarias: 'Secretarias',
  instituicoes: 'Instituicoes',
  unidades: 'Unidades de consumo',
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatCompact = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);

export default function FinanceiroPanorama({ panorama }: FinanceiroPanoramaProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('secretarias');

  const summary = useMemo(() => {
    const totalSecretarias = panorama.secretarias.length;
    const totalInstituicoes = panorama.instituicoes.length;
    const gastoSecretarias = panorama.secretarias.reduce((acc, item) => acc + item.totalGastos, 0);
    const gastoInstituicoes = panorama.instituicoes.reduce((acc, item) => acc + item.totalGastos, 0);

    return {
      totalSecretarias,
      totalInstituicoes,
      gastoSecretarias,
      gastoInstituicoes,
    };
  }, [panorama]);

  const secretariasTop = panorama.secretarias.slice(0, 6);
  const instituicoesTop = panorama.instituicoes.slice(0, 8);

  return (
    <section className="civitas-surface civitas-enter overflow-hidden p-0">
      <div
        className="relative overflow-hidden border-b border-[var(--divider)] px-5 py-5 text-[var(--foreground-on-brand)] lg:px-6"
        style={{ backgroundImage: "var(--finance-panorama-hero-bg)" }}
      >
        <div className="absolute -right-12 top-4 h-32 w-32 rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand)] blur-sm" />
        <div className="absolute bottom-[-38px] right-16 h-24 w-24 rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand-strong)]" />

        <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-on-brand-muted)]">
              Radar financeiro
              <span className="h-2 w-2 rounded-sm bg-[var(--tertialy-2)]" />
            </span>

            <h3 className="mt-4 max-w-2xl text-[24px] font-semibold leading-tight text-[var(--foreground-on-brand)] sm:text-[28px]">
              Leitura macro por secretaria, instituicao e unidade de consumo.
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-on-brand-soft)]">
              Painel executivo para localizar concentracao de gasto por orgao, rede institucional e UC.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-on-brand-subtle)]">
                Secretarias
              </p>
              <p className="mt-2 text-[22px] font-semibold leading-none">{summary.totalSecretarias}</p>
              <p className="mt-2 text-xs text-[var(--foreground-on-brand-soft)]">{formatCurrency(summary.gastoSecretarias)}</p>
            </div>

            <div className="rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-on-brand-subtle)]">
                Instituicoes
              </p>
              <p className="mt-2 text-[22px] font-semibold leading-none">{summary.totalInstituicoes}</p>
              <p className="mt-2 text-xs text-[var(--foreground-on-brand-soft)]">{formatCurrency(summary.gastoInstituicoes)}</p>
            </div>

            <div className="rounded-sm border border-[var(--border-on-brand)] bg-[var(--surface-on-brand)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-on-brand-subtle)]">
                Endpoint UC
              </p>
              <p className="mt-2 text-[22px] font-semibold leading-none">API</p>
              <p className="mt-2 text-xs text-[var(--foreground-on-brand-soft)]">nao documentada</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 lg:p-6">
        <div className="financeiro-panorama-tabs-shell relative overflow-hidden rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-subtle))] p-2">
          <div className="financeiro-panorama-tabs-scroll civitas-scrollbar flex gap-2 overflow-x-auto pr-6">
            {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => {
              const active = tab === activeTab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  disabled={tab === 'unidades'}
                  className={`shrink-0 rounded-sm border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'border-[var(--secundary-1)] bg-[var(--secundary-1)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)]'
                      : tab === 'unidades'
                        ? 'cursor-not-allowed border-[var(--border-soft)] bg-[var(--surface-subtle)] text-[var(--foreground-soft)] opacity-70'
                        : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] hover:border-[var(--primary-1)] hover:text-[var(--secundary-1)]'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'secretarias' ? (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                    Ranking por secretaria
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Maiores concentracoes de gasto acumulado por secretaria.
                  </p>
                </div>
                <span className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-semibold text-[var(--secundary-1)]">
                  {summary.totalSecretarias} orgaos
                </span>
              </div>

              <div className="financeiro-panorama-list-shell mt-4 max-h-[30rem] overflow-hidden rounded-sm">
                <div className="civitas-scrollbar max-h-[30rem] space-y-3 overflow-y-auto pr-2">
                  {secretariasTop.map((item, index) => (
                    <article
                      key={item.idSecretaria}
                      className="grid gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 md:grid-cols-[auto_1fr_auto]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--surface-danger-soft)] text-sm font-semibold text-[var(--tone-danger-text)]">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-[var(--foreground)]">
                          {item.nomeSecretaria}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                          {item.quantidadeInstituicoes} instituicoes vinculadas
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-lg font-semibold text-[var(--secundary-1)]">
                          {formatCurrency(item.totalGastos)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                          {formatCompact(item.quantidadeDespesas)} despesas
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                Rede institucional da secretaria
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Cada secretaria com sua base institucional e volume financeiro.
              </p>

              <div className="financeiro-panorama-list-shell mt-4 max-h-[30rem] overflow-hidden rounded-sm">
                <div className="civitas-scrollbar max-h-[30rem] space-y-3 overflow-y-auto pr-2">
                  {panorama.secretarias.slice(0, 4).map((secretaria) => {
                    const vinculadas = panorama.instituicoes
                      .filter((instituicao) => instituicao.secretariaId === secretaria.idSecretaria)
                      .slice(0, 3);

                    return (
                      <div
                        key={secretaria.idSecretaria}
                        className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-[var(--foreground)]">
                              {secretaria.nomeSecretaria}
                            </h4>
                            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                              {secretaria.quantidadeInstituicoes} instituicoes ativas no panorama
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-[var(--secundary-1)]">
                            {formatCurrency(secretaria.totalGastos)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {vinculadas.length > 0 ? (
                            vinculadas.map((instituicao) => (
                              <span
                                key={instituicao.idInstituicao}
                                className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]"
                              >
                                {instituicao.nomeInstituicao}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-sm border border-dashed border-[var(--border-default)] px-3 py-1 text-xs text-[var(--foreground-soft)]">
                              Sem instituicoes com gasto consolidado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'instituicoes' ? (
          <div className="financeiro-panorama-list-shell max-h-[38rem] overflow-hidden rounded-sm">
            <div className="civitas-scrollbar grid max-h-[38rem] gap-4 overflow-y-auto pr-2 lg:grid-cols-2">
              {instituicoesTop.map((item, index) => (
                <article
                  key={item.idInstituicao}
                  className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,_var(--surface-elevated),_var(--surface-subtle))] p-4 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        #{String(index + 1).padStart(2, '0')}
                      </div>
                      <h4 className="mt-3 truncate text-lg font-semibold text-[var(--foreground)]">
                        {item.nomeInstituicao}
                      </h4>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{item.secretariaNome}</p>
                    </div>

                    <div className="rounded-sm bg-[var(--surface-info-soft)] px-3 py-2 text-right">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                        Gasto
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--secundary-1)]">
                        {formatCurrency(item.totalGastos)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Despesas
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                        {formatCompact(item.quantidadeDespesas)}
                      </p>
                    </div>

                    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Secretaria
                      </p>
                      <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
                        {item.secretariaNome}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Unidade de consumo
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            Esta leitura foi removida do frontend porque o contrato atual nao documenta rota agregada de gastos por
            `codigo` ou `uc`. Quando o backend expuser esse endpoint, a aba pode voltar consumindo API de forma integral.
          </p>
        </div>
      </div>
    </section>
  );
}
