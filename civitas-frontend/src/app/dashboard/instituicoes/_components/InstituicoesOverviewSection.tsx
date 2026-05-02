"use client";

import { InsightsGrid, type InsightMetric } from "@/components/financeiro-insights";
import type { InstituicaoFinanceResumo } from "../_types";
import InstituicaoFinanceCard from "./InstituicaoFinanceCard";

type InstituicoesOverviewSectionProps = {
  metrics: InsightMetric[];
  topInstituicoes: InstituicaoFinanceResumo[];
  onOpenInstituicao: (instituicao: InstituicaoFinanceResumo) => void;
};

export default function InstituicoesOverviewSection({
  metrics,
  topInstituicoes,
  onOpenInstituicao,
}: InstituicoesOverviewSectionProps) {
  return (
    <section className="civitas-surface civitas-enter mb-5 space-y-5 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Relacao institucional
          </p>
          <h2 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
            Instituicao x secretaria com gastos e saldo em contexto.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            O backend fornece a amarracao entre instituicao e secretaria, e aqui a
            leitura financeira combina despesas, orcamentos e codigos para abrir
            detalhes sem sair da listagem.
          </p>
        </div>
      </div>

      <InsightsGrid metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-2">
        {topInstituicoes.map((instituicao) => (
          <InstituicaoFinanceCard
            key={instituicao.id}
            instituicao={instituicao}
            onOpenDetails={onOpenInstituicao}
          />
        ))}
      </div>
    </section>
  );
}
