import type React from "react";
import type { DespesaDashboardSummary } from "@/hooks/useDespesasDashboard";
import { formatCurrency } from "../despesas.utils";

const summaryCardStyles: Record<
  "teal" | "slate" | "amber",
  {
    container: React.CSSProperties;
    value: React.CSSProperties;
    icon: React.CSSProperties;
  }
> = {
  teal: {
    container: {
      background: "var(--surface-accent-teal)",
      borderColor: "var(--border-accent-teal)",
    },
    value: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-teal)",
      color: "var(--text-accent-teal)",
    },
    icon: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-teal)",
      color: "var(--text-accent-teal)",
    },
  },
  slate: {
    container: {
      background: "var(--surface-accent-slate)",
      borderColor: "var(--border-accent-slate)",
    },
    value: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-slate)",
      color: "var(--text-accent-slate)",
    },
    icon: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-slate)",
      color: "var(--text-accent-slate)",
    },
  },
  amber: {
    container: {
      background: "var(--surface-accent-amber)",
      borderColor: "var(--border-accent-amber)",
    },
    value: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-amber)",
      color: "var(--text-accent-amber)",
    },
    icon: {
      background: "var(--surface-elevated)",
      borderColor: "var(--border-accent-amber)",
      color: "var(--text-accent-amber)",
    },
  },
};

type SummaryCardProps = {
  title: string;
  subtitle: string;
  value: number;
  visible: boolean;
  tone: "teal" | "slate" | "amber";
  icon: string;
};

function SummaryCard({ title, subtitle, value, visible, tone, icon }: SummaryCardProps) {
  const toneStyle = summaryCardStyles[tone];

  return (
    <article
      className="despesas-summary-card relative overflow-hidden rounded-sm border p-5 text-[var(--foreground)] shadow-[var(--shadow-xs)]"
      style={toneStyle.container}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            Conta digital
          </p>
          <h2 className="mt-4 text-[30px] font-semibold leading-none text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{subtitle}</p>
        </div>

        <span
          className="despesas-summary-card__icon flex h-16 w-16 items-center justify-center rounded-sm border"
          style={toneStyle.icon}
        >
          <span className="material-symbols-outlined !text-[34px]">{icon}</span>
        </span>
      </div>

      <div
        className="despesas-summary-card__value relative z-10 mt-5 rounded-sm border px-4 py-3"
        style={toneStyle.value}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-soft)]">
          Valor atual
        </p>
        <p className="mt-2 text-[28px] font-semibold leading-none">
          {visible ? formatCurrency(value) : "* * * * * *"}
        </p>
      </div>
    </article>
  );
}

type DespesasResumoProps = {
  summary: DespesaDashboardSummary;
  valuesVisible: boolean;
  onToggleValues: () => void;
  onScrollToList: () => void;
};

export default function DespesasResumo({
  summary,
  valuesVisible,
  onToggleValues,
  onScrollToList,
}: DespesasResumoProps) {
  return (
    <>
      <section className="despesas-hero civitas-enter overflow-hidden rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-6 py-7 shadow-[var(--shadow-sm)] sm:px-8">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onScrollToList}
              className="civitas-action civitas-action--primary rounded-sm px-5 py-3 text-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">arrow_downward</span>
              Ir para listagem
            </button>

            <button
              type="button"
              onClick={onToggleValues}
              className="civitas-action civitas-action--ghost rounded-sm px-5 py-3 text-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {valuesVisible ? "visibility_off" : "visibility"}
              </span>
              {valuesVisible ? "Ocultar valores" : "Mostrar valores"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          title="Saldo total"
          subtitle="Entrada menos saida com filtros aplicados"
          value={summary.saldoTotal}
          visible={valuesVisible}
          tone="teal"
          icon="account_balance_wallet"
        />
        <SummaryCard
          title="Entrada"
          subtitle="Orcamentos compativeis com o painel"
          value={summary.entrada}
          visible={valuesVisible}
          tone="slate"
          icon="south_west"
        />
        <SummaryCard
          title="Saida"
          subtitle="Total das despesas filtradas"
          value={summary.saida}
          visible={valuesVisible}
          tone="amber"
          icon="north_east"
        />
      </section>
    </>
  );
}
