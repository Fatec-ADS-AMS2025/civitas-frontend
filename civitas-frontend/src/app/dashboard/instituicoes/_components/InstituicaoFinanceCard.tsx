"use client";

import type { InstituicaoFinanceResumo } from "../_types";

type InstituicaoFinanceCardProps = {
  instituicao: InstituicaoFinanceResumo;
  onOpenDetails: (instituicao: InstituicaoFinanceResumo) => void;
};

export default function InstituicaoFinanceCard({
  instituicao,
  onOpenDetails,
}: InstituicaoFinanceCardProps) {
  return (
    <article className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-subtle))] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="civitas-chip civitas-chip--neutral px-3 py-1 text-[10px] tracking-[0.14em]">
            {instituicao.secretariaNome}
          </span>
          <h3 className="mt-3 truncate text-xl font-semibold text-[var(--foreground)]">
            {instituicao.nome}
          </h3>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {instituicao.quantidadeDespesas} despesas em {instituicao.quantidadeCodigos}{" "}
            codigos consolidados
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetails(instituicao)}
          className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
        >
          Ver gastos
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="civitas-subcard p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Gasto
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
            {instituicao.totalGastosFormatado}
          </p>
        </div>
        <div className="civitas-subcard p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Orcamento
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {instituicao.totalOrcamentosFormatado}
          </p>
        </div>
        <div className="civitas-subcard p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Saldo
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
            {instituicao.saldoFormatado}
          </p>
        </div>
      </div>
    </article>
  );
}
