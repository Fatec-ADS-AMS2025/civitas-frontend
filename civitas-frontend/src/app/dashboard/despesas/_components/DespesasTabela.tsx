import type React from "react";
import Input from "@/components/Input";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import type { DespesasListSearchState, DespesasTableData } from "../despesas.types";
import DespesasTabelaRows from "./DespesasTabelaRows";

type DespesasTabelaProps = {
  listSectionRef: React.RefObject<HTMLElement | null>;
  search: DespesasListSearchState;
  tableData: DespesasTableData;
  loading: boolean;
  error: string | null;
  canExport: boolean;
  onOpenExport: () => void;
  onView: (despesa: DespesaDashboardRow) => void;
  onEdit: (despesa: DespesaDashboardRow) => void;
  onDelete: (despesa: DespesaDashboardRow) => void;
  onPayment: (despesa: DespesaDashboardRow) => void;
};

export default function DespesasTabela({
  listSectionRef,
  search,
  tableData,
  loading,
  error,
  canExport,
  onOpenExport,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: DespesasTabelaProps) {
  return (
    <section
      ref={listSectionRef}
      className="despesas-table-section civitas-table-shell civitas-enter overflow-hidden rounded-sm"
    >
      <div className="despesas-table-header border-b border-[var(--divider)] px-5 py-5 sm:px-6">
        <h3 className="text-[36px] font-bold leading-none text-[var(--secundary-1)]">
          Listagem de despesas
        </h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Painel com leitura rapida de categoria, valor, data, situacao e acoes
          de manutencao. Use os filtros abaixo para isolar um unico codigo ou
          uma instituicao especifica.
        </p>
      </div>

      <div className="despesas-table-filterbar grid gap-4 border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:grid-cols-[1fr_1fr_auto] lg:px-6">
        <Input
          value={search.codigoSearch}
          onChange={(event) => search.setCodigoSearch(event.target.value)}
          label="Filtrar por codigo"
          placeholder="Ex.: contrato, energia, 001"
        />
        <Input
          value={search.instituicaoSearch}
          onChange={(event) => search.setInstituicaoSearch(event.target.value)}
          label="Filtrar por instituicao"
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
          Limpar listagem
        </button>
      </div>

      {canExport ? (
        <div className="despesas-table-exportbar flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 lg:px-6">
          <button
            type="button"
            onClick={onOpenExport}
            className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-2.5 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
          >
            <span className="material-symbols-outlined text-base text-[var(--foreground)]">
              print
            </span>
            Exportar / Imprimir
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mx-5 mt-5 rounded-sm border border-[var(--border-default)] bg-[var(--surface-danger-soft)] px-4 py-3 text-sm text-[var(--status-inactive-text)] sm:mx-6">
          {error}
        </div>
      ) : null}

      <div className="despesas-table-scroll overflow-x-auto px-4 py-5 sm:px-6">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              <th className="px-4 py-2">Codigo</th>
              <th className="px-4 py-2">Tipo codigo</th>
              <th className="px-4 py-2">Consumo Previsto</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Descricao</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Situacao</th>
              <th className="px-4 py-2">Documento</th>
              <th className="px-4 py-2 text-center">Acao</th>
            </tr>
          </thead>
          <tbody>
            <DespesasTabelaRows
              loading={loading}
              despesas={tableData.visibleDespesas}
              hasLocalListSearch={tableData.hasLocalListSearch}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onPayment={onPayment}
            />
          </tbody>
        </table>
      </div>

      <div className="despesas-table-footer flex flex-col gap-2 border-t border-[var(--divider)] bg-[var(--surface-subtle)] px-5 py-4 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>{tableData.listResume}</span>
        <span>Ultima atualizacao: {tableData.lastUpdatedLabel}</span>
      </div>
    </section>
  );
}
