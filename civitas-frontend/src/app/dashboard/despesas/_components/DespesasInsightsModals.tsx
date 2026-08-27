import type { Dispatch, SetStateAction } from "react";
import { DespesasRelacionadasTable, type InsightMetric, InsightsModal } from "@/components/financeiro-insights";
import type { FinanceCodigoResumo, FinanceInstituicaoResumo } from "@/lib/financeiro-relations";

type DespesasInsightsModalsProps = {
  selectedCodigoGroup: FinanceCodigoResumo | null;
  setSelectedCodigoGroup: Dispatch<SetStateAction<FinanceCodigoResumo | null>>;
  selectedInstituicaoGroup: FinanceInstituicaoResumo | null;
  setSelectedInstituicaoGroup: Dispatch<SetStateAction<FinanceInstituicaoResumo | null>>;
};

export default function DespesasInsightsModals({
  selectedCodigoGroup,
  setSelectedCodigoGroup,
  selectedInstituicaoGroup,
  setSelectedInstituicaoGroup,
}: DespesasInsightsModalsProps) {
  return (
    <>
      <InsightsModal
        open={selectedCodigoGroup !== null}
        onClose={() => setSelectedCodigoGroup(null)}
        title={selectedCodigoGroup?.codigo ?? ""}
        subtitle="Todas as despesas do mesmo codigo, incluindo distribuicao por instituicao e secretaria."
        metrics={selectedCodigoGroup ? getCodigoMetrics(selectedCodigoGroup) : []}
      >
        <DespesasRelacionadasTable
          despesas={selectedCodigoGroup?.despesas ?? []}
          emptyMessage="Nenhuma despesa encontrada para este codigo."
        />
      </InsightsModal>

      <InsightsModal
        open={selectedInstituicaoGroup !== null}
        onClose={() => setSelectedInstituicaoGroup(null)}
        title={selectedInstituicaoGroup?.nome ?? ""}
        subtitle={`Agrupamento de debitos por instituicao, com codigos consolidados e relacao direta com a secretaria ${selectedInstituicaoGroup?.secretariaNome ?? ""}.`}
        metrics={selectedInstituicaoGroup ? getInstituicaoMetrics(selectedInstituicaoGroup) : []}
      >
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Codigos da instituicao
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Todos os grupos de despesas da instituicao
            </h4>
          </div>
          <InstituicaoCodigos selectedInstituicaoGroup={selectedInstituicaoGroup} />
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Despesas da instituicao
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Lista completa das despesas agrupadas
            </h4>
          </div>

          <DespesasRelacionadasTable
            despesas={selectedInstituicaoGroup?.despesas ?? []}
            emptyMessage="Nenhuma despesa encontrada para esta instituicao."
            showInstituicao={false}
          />
        </section>
      </InsightsModal>
    </>
  );
}

function InstituicaoCodigos({
  selectedInstituicaoGroup,
}: {
  selectedInstituicaoGroup: FinanceInstituicaoResumo | null;
}) {
  if (!selectedInstituicaoGroup || selectedInstituicaoGroup.codigos.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
        Nenhum codigo associado a esta instituicao.
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {selectedInstituicaoGroup.codigos.map((codigo) => (
        <article
          key={`${selectedInstituicaoGroup.id}-${codigo.codigoNormalizado}`}
          className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                Codigo
              </p>
              <h5 className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">{codigo.codigo}</h5>
            </div>
            <span className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
              {codigo.quantidadeDespesas} despesas
            </span>
          </div>
          <p className="mt-4 text-base font-semibold text-[var(--foreground)]">{codigo.totalGastosFormatado}</p>
        </article>
      ))}
    </div>
  );
}

function getCodigoMetrics(group: FinanceCodigoResumo): InsightMetric[] {
  return [
    {
      label: "Gasto total",
      value: group.totalGastosFormatado,
      hint: "Soma de todas as despesas do codigo",
      tone: "teal",
    },
    {
      label: "Despesas",
      value: String(group.quantidadeDespesas),
      hint: "Lancamentos vinculados ao codigo",
      tone: "amber",
    },
    {
      label: "Instituicoes",
      value: String(group.quantidadeInstituicoes),
      hint: "Distribuicao institucional",
      tone: "slate",
    },
    {
      label: "Secretarias",
      value: String(group.quantidadeSecretarias),
      hint: `Ultima referencia em ${group.ultimaReferenciaFormatada}`,
      tone: "coral",
    },
  ];
}

function getInstituicaoMetrics(group: FinanceInstituicaoResumo): InsightMetric[] {
  return [
    {
      label: "Gasto",
      value: group.totalGastosFormatado,
      hint: "Total das despesas da instituicao",
      tone: "teal",
    },
    {
      label: "Orcamento",
      value: group.totalOrcamentosFormatado,
      hint: "Orcamentos vinculados a instituicao",
      tone: "slate",
    },
    {
      label: "Saldo",
      value: group.saldoFormatado,
      hint: "Balanca da instituicao",
      tone: "amber",
    },
    {
      label: "Codigos",
      value: String(group.quantidadeCodigos),
      hint: `${group.quantidadeDespesas} despesas consolidadas`,
      tone: "coral",
    },
  ];
}
