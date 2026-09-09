import { InsightsGrid } from "@/components/financeiro-insights";
import Input from "@/components/Input";
import type { FinanceCodigoResumo, FinanceInstituicaoResumo } from "@/lib/financeiro-relations";
import type { DespesasExplorerData, DespesasExplorerState } from "../despesas.types";
import DespesasExplorerGroups from "./DespesasExplorerGroups";

type DespesasExplorerProps = {
  isOpen: boolean;
  onToggleOpen: () => void;
  search: DespesasExplorerState;
  data: DespesasExplorerData;
  onSelectCodigoGroup: (group: FinanceCodigoResumo) => void;
  onSelectInstituicaoGroup: (group: FinanceInstituicaoResumo) => void;
};

export default function DespesasExplorer({
  isOpen,
  onToggleOpen,
  search,
  data,
  onSelectCodigoGroup,
  onSelectInstituicaoGroup,
}: DespesasExplorerProps) {
  return (
    <section className="civitas-surface civitas-enter space-y-5 rounded-sm p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Explorador de relacoes
          </p>
          <h3 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
            Abra a secao abaixo para pesquisar por codigo ou instituicao.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            A exploracao detalhada fica fechada por padrao para reduzir ruido visual. Quando abrir, voce pode localizar
            um codigo especifico ou uma instituicao e abrir os gastos consolidados daquele recorte.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleOpen}
          className="civitas-action civitas-action--ghost rounded-sm px-4 py-2.5 text-sm"
        >
          <span className="material-symbols-outlined !text-[18px]">{isOpen ? "expand_less" : "expand_more"}</span>
          {isOpen ? "Fechar explorador" : "Abrir explorador"}
        </button>
      </div>

      {!isOpen ? (
        <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-5 py-8 text-sm text-[var(--foreground-soft)]">
          Abra esta secao para usar a pesquisa por codigo e instituicao e navegar pelos agrupamentos de despesas.
        </div>
      ) : (
        <>
          <InsightsGrid metrics={data.metrics} />

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <Input
              value={search.codigoSearch}
              onChange={(event) => search.setCodigoSearch(event.target.value)}
              label="Pesquisar codigo"
              placeholder="Ex.: energia, contrato, 001"
            />
            <Input
              value={search.instituicaoSearch}
              onChange={(event) => search.setInstituicaoSearch(event.target.value)}
              label="Pesquisar instituicao"
              placeholder="Ex.: escola, secretaria, unidade"
            />
            <button
              type="button"
              onClick={() => {
                search.setCodigoSearch("");
                search.setInstituicaoSearch("");
              }}
              className="civitas-action civitas-action--ghost self-end rounded-sm px-4 py-2.5 text-sm"
            >
              Limpar busca
            </button>
          </div>

          <DespesasExplorerGroups
            codigoGroups={data.topCodigoGroups}
            instituicaoGroups={data.topInstituicaoGroups}
            hasExplorerSearch={data.hasExplorerSearch}
            onSelectCodigoGroup={onSelectCodigoGroup}
            onSelectInstituicaoGroup={onSelectInstituicaoGroup}
          />
        </>
      )}
    </section>
  );
}
