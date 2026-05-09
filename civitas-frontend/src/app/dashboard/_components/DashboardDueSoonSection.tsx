"use client";

import { EmptyState } from "@/components/feedback-states";
import type { DueSoonExpense } from "./dashboard.types";
import {
  DASHBOARD_HIDDEN_VALUE,
  formatCurrency,
  formatDate,
  getDueSoonLabel,
} from "./dashboard.utils";

type DashboardDueSoonSectionProps = {
  items: DueSoonExpense[];
  showMoneyValues: boolean;
};

export function DashboardDueSoonSection({
  items,
  showMoneyValues,
}: DashboardDueSoonSectionProps) {
  return (
    <article className="civitas-surface p-5">
      <span className="inline-flex rounded-sm bg-[#FFF0DD] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9B5B00]">
        Prioridades
      </span>
      <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">
        Vencimentos proximos
      </h2>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
        Despesas com vencimento em ate 7 dias.
      </p>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title="Sem vencimentos proximos"
            description="Nenhuma despesa filtrada vence nos proximos 7 dias."
          />
        ) : (
          items.map((item) => (
            <div
              key={`due-${item.id}`}
              className="rounded-sm border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {item.descricao}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    {item.categoria}
                  </p>
                </div>
                <span className="rounded-sm bg-[#FFF1DB] px-3 py-1 text-xs font-semibold text-[#9B5B00]">
                  {getDueSoonLabel(item.daysUntilDue)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--foreground-muted)]">
                  Vencimento: {formatDate(item.raw.dataVencimento ?? item.data)}
                </span>
                <span className="font-semibold text-[var(--secundary-1)]">
                  {showMoneyValues ? formatCurrency(item.valor) : DASHBOARD_HIDDEN_VALUE}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
