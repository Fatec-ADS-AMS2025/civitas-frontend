"use client";

import React from "react";
import Modal from "@/components/modal";
import type { FinanceDespesaRelacionada } from "@/lib/financeiro-relations";

export type InsightMetric = {
  label: string;
  value: string;
  hint: string;
  tone?: "teal" | "amber" | "slate" | "coral";
};

const toneClassNames: Record<NonNullable<InsightMetric["tone"]>, string> = {
  teal: "from-[#0D7A7C] via-[#2EAAA7] to-[#6AD1C4] text-white",
  amber: "from-[#B96416] via-[#F59E0B] to-[#FFD169] text-[#372300]",
  slate: "from-[#19212B] via-[#303946] to-[#556173] text-white",
  coral: "from-[#8F3A32] via-[#D76855] to-[#F4AB89] text-white",
};

export function InsightsGrid({ metrics }: { metrics: InsightMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const tone = metric.tone ?? "teal";

        return (
          <article
            key={`${metric.label}-${metric.value}`}
            className={`relative overflow-hidden rounded-sm bg-gradient-to-br p-4 shadow-[0_18px_28px_rgba(8,22,26,0.12)] ${toneClassNames[tone]}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_38%)]" />
            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                {metric.label}
              </p>
              <p className="mt-4 text-[28px] font-semibold leading-none">{metric.value}</p>
              <p className="mt-2 text-sm opacity-85">{metric.hint}</p>
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
        <div className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(135deg,rgba(8,75,86,0.98),rgba(26,121,126,0.96)_52%,rgba(95,196,186,0.92))] px-5 py-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
            Leitura consolidada
          </p>
          <h3 className="mt-3 text-[28px] font-semibold leading-tight">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/76">{subtitle}</p>
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
              <th className="px-4 py-3">Registro</th>
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
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-sm border border-[#E8D79C] bg-[#FFF6D9] px-3 py-1 text-xs font-semibold text-[#5F4B00]">
                    {despesa.registro}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-[var(--secundary-1)]">
                  {despesa.codigo}
                </td>
                <td className="px-4 py-3">{despesa.descricao}</td>
                {showInstituicao ? (
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">
                    {despesa.instituicaoNome}
                  </td>
                ) : null}
                {showSecretaria ? (
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">
                    {despesa.secretariaNome}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right font-semibold text-[var(--secundary-1)]">
                  {despesa.valorFormatado}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                    {despesa.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--foreground-muted)]">
                  {despesa.dataReferenciaFormatada}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


