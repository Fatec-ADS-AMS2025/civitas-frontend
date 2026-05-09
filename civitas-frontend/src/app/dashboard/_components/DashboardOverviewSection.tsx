"use client";

import type { DashboardQuickLink, DashboardSummaryRow } from "./dashboard.types";

type DashboardOverviewSectionProps = {
  quickLinks: DashboardQuickLink[];
  summaryRows: DashboardSummaryRow[];
  hiddenValue: string;
  onNavigate: (href: string) => void;
  onToggleValues: () => void;
};

export function DashboardOverviewSection({
  quickLinks,
  summaryRows,
  hiddenValue,
  onNavigate,
  onToggleValues,
}: DashboardOverviewSectionProps) {
  return (
    <section className="civitas-surface civitas-enter px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
            Painel principal
          </span>
          <h2 className="mt-3 text-[22px] font-semibold text-[var(--secundary-1)] sm:text-[24px]">
            Operacao direta
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Resumo financeiro, acessos centrais e fila recente de despesas sem blocos duplicados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => onNavigate(link.href)}
              className="rounded-sm border border-[var(--border-default)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus:outline-none focus:ring-4 focus:ring-black/5"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 divide-y divide-[var(--border-soft)]">
        {summaryRows.map((item) => (
          <div
            key={item.label}
            className="grid gap-2 py-3 sm:grid-cols-[180px_1fr] sm:items-center"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              {item.label}
            </span>
            <div>
              <div className="flex gap-3">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  {item.value}
                </p>

                {item.toggleable ? (
                  <button type="button" onClick={onToggleValues}>
                    {item.value === hiddenValue ? (
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">
                        visibility_off
                      </span>
                    )}
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">{item.helper}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
