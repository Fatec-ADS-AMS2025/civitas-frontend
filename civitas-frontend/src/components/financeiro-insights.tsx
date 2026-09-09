"use client";

import type React from "react";
import Modal from "@/components/modal";
import type { FinanceDespesaRelacionada } from "@/lib/financeiro-relations";

export type InsightMetric = {
  label: string;
  value: string;
  hint: string;
  tone?: "teal" | "amber" | "slate" | "coral";
};

const toneStyles: Record<NonNullable<InsightMetric["tone"]>, React.CSSProperties> = {
  teal: {
    background: "var(--surface-accent-teal)",
    borderColor: "var(--border-accent-teal)",
    color: "var(--foreground)",
  },
  amber: {
    background: "var(--surface-accent-amber)",
    borderColor: "var(--border-accent-amber)",
    color: "var(--foreground)",
  },
  slate: {
    background: "var(--surface-accent-slate)",
    borderColor: "var(--border-accent-slate)",
    color: "var(--foreground)",
  },
  coral: {
    background: "var(--surface-accent-coral)",
    borderColor: "var(--border-accent-coral)",
    color: "var(--foreground)",
  },
};

export function InsightsGrid({ metrics }: { metrics: InsightMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const tone = metric.tone ?? "teal";

        return (
          <article
            key={`${metric.label}-${metric.value}`}
            className="dashboard-metric-card relative overflow-hidden rounded-sm border p-4 shadow-[var(--shadow-xs)]"
            style={toneStyles[tone]}
          >
            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                {metric.label}
              </p>
              <p className="mt-4 text-[28px] font-semibold leading-none text-[var(--foreground)]">{metric.value}</p>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">{metric.hint}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function InsightsModal({
  open,
  onClose,
  title,
  subtitle,
  metrics,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  metrics: InsightMetric[];
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal value={open} setValue={onClose}>
      <div className="space-y-6">
        <div className="insights-modal__header rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-5 py-6 text-[var(--foreground)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Leitura consolidada
          </p>
          <h3 className="mt-3 text-[28px] font-semibold leading-tight text-[var(--secundary-1)]">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">{subtitle}</p>
        </div>

        <InsightsGrid metrics={metrics} />

        <div className="space-y-5">{children}</div>
      </div>
    </Modal>
  );
}

export function DespesasRelacionadasTable({
  despesas,
  emptyMessage,
  showInstituicao = true,
  showSecretaria = true,
}: {
  despesas: FinanceDespesaRelacionada[];
  emptyMessage: string;
  showInstituicao?: boolean;
  showSecretaria?: boolean;
}) {
  if (despesas.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[var(--surface-subtle)] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Descricao</th>
              {showInstituicao ? <th className="px-4 py-3">Instituicao</th> : null}
              {showSecretaria ? <th className="px-4 py-3">Secretaria</th> : null}
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((despesa) => (
              <tr
                key={`${despesa.id}-${despesa.codigoNormalizado}`}
                className="border-t border-[var(--divider)] text-sm text-[var(--foreground)]"
              >
                <td className="px-4 py-3 font-semibold text-[var(--secundary-1)]">{despesa.codigo}</td>
                <td className="px-4 py-3">{despesa.descricao}</td>
                {showInstituicao ? (
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{despesa.instituicaoNome}</td>
                ) : null}
                {showSecretaria ? (
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{despesa.secretariaNome}</td>
                ) : null}
                <td className="px-4 py-3 text-right font-semibold text-[var(--secundary-1)]">
                  {despesa.valorFormatado}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                    {despesa.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">{despesa.dataReferenciaFormatada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
