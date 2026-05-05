"use client";

import type { FinanceCodigoResumo } from "@/lib/financeiro-relations";

type InstituicaoCodigoResumoCardProps = {
  codigo: FinanceCodigoResumo;
};

export default function InstituicaoCodigoResumoCard({
  codigo,
}: InstituicaoCodigoResumoCardProps) {
  return (
    <article className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Codigo
          </p>
          <h5 className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
            {codigo.codigo}
          </h5>
        </div>
        <span className="civitas-chip civitas-chip--neutral px-3 py-1 text-xs normal-case tracking-normal text-[var(--foreground-muted)]">
          {codigo.quantidadeDespesas} despesas
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="civitas-subcard p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Total
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {codigo.totalGastosFormatado}
          </p>
        </div>
        <div className="civitas-subcard p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Ultima referencia
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {codigo.ultimaReferenciaFormatada}
          </p>
        </div>
      </div>
    </article>
  );
}
