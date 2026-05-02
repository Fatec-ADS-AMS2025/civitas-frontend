"use client";

import {
  DespesasRelacionadasTable,
  InsightsModal,
} from "@/components/financeiro-insights";
import type { InsightMetric } from "@/components/financeiro-insights";
import type { InstituicaoFinanceResumo } from "../_types";
import InstituicaoCodigoResumoCard from "./InstituicaoCodigoResumoCard";

type InstituicaoInsightsModalProps = {
  instituicao: InstituicaoFinanceResumo | null;
  onClose: () => void;
};

const buildInstituicaoMetrics = (
  instituicao: InstituicaoFinanceResumo | null
): InsightMetric[] => {
  if (!instituicao) {
    return [];
  }

  return [
    {
      label: "Gasto total",
      value: instituicao.totalGastosFormatado,
      hint: "Soma consolidada das despesas da instituicao",
      tone: "teal",
    },
    {
      label: "Orcamento",
      value: instituicao.totalOrcamentosFormatado,
      hint: "Total de orcamentos vinculados",
      tone: "slate",
    },
    {
      label: "Saldo",
      value: instituicao.saldoFormatado,
      hint: "Balanca entre orcamento e gasto",
      tone: "amber",
    },
    {
      label: "Codigos",
      value: String(instituicao.quantidadeCodigos),
      hint: `${instituicao.quantidadeDespesas} despesas relacionadas`,
      tone: "coral",
    },
  ];
};

export default function InstituicaoInsightsModal({
  instituicao,
  onClose,
}: InstituicaoInsightsModalProps) {
  return (
    <InsightsModal
      open={instituicao !== null}
      onClose={onClose}
      title={instituicao?.nome ?? ""}
      subtitle={`Instituicao vinculada a ${instituicao?.secretariaNome ?? "sem secretaria"} com leitura por codigo e lista completa de despesas.`}
      metrics={buildInstituicaoMetrics(instituicao)}
    >
      <section className="space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Agrupamento por codigo
          </p>
          <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Todos os gastos do mesmo codigo dentro da instituicao
          </h4>
        </div>

        {instituicao && instituicao.codigos.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {instituicao.codigos.map((codigo) => (
              <InstituicaoCodigoResumoCard
                key={`${instituicao.id}-${codigo.codigoNormalizado}`}
                codigo={codigo}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
            Nenhum codigo vinculado a esta instituicao ate o momento.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Despesas relacionadas
          </p>
          <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Lista completa das despesas da instituicao
          </h4>
        </div>

        <DespesasRelacionadasTable
          despesas={instituicao?.despesas ?? []}
          emptyMessage="Nenhuma despesa encontrada para esta instituicao."
          showInstituicao={false}
        />
      </section>
    </InsightsModal>
  );
}
