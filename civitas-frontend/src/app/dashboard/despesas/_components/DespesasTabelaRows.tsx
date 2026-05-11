import type React from "react";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { ICON_BUTTON_CLASS_NAME } from "../despesas.constants";
import {
  getDespesaCodigo,
  getStatusBadgeClassName,
  isPendingDespesa,
} from "../despesas.utils";

type DespesasTabelaRowsProps = {
  loading: boolean;
  despesas: DespesaDashboardRow[];
  hasLocalListSearch: boolean;
  onView: (despesa: DespesaDashboardRow) => void;
  onEdit: (despesa: DespesaDashboardRow) => void;
  onDelete: (despesa: DespesaDashboardRow) => void;
  onPayment: (despesa: DespesaDashboardRow) => void;
};

export default function DespesasTabelaRows({
  loading,
  despesas,
  hasLocalListSearch,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: DespesasTabelaRowsProps) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <tr
            key={`loading-row-${rowIndex}`}
            className="despesas-table-row despesas-table-row--loading rounded-sm bg-[var(--surface-subtle)]"
          >
            {Array.from({ length: 9 }).map((__, cellIndex) => (
              <td
                key={`loading-cell-${rowIndex}-${cellIndex}`}
                className="despesas-table-cell px-4 py-5"
              >
                <div className="despesas-table-skeleton h-5 animate-pulse rounded-sm bg-[var(--border-soft)]" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  if (despesas.length === 0) {
    return (
      <tr>
        <td
          colSpan={9}
          className="despesas-table-empty rounded-sm border border-dashed border-[var(--border-default)] px-4 py-10 text-center text-[var(--foreground-soft)]"
        >
          {hasLocalListSearch
            ? "Nenhuma despesa encontrada para o codigo ou instituicao informados."
            : "Nenhuma despesa encontrada com os filtros atuais."}
        </td>
      </tr>
    );
  }

  return (
    <>
      {despesas.map((despesa, index) => (
        <tr
          key={despesa.id}
          style={getEnterDelayStyle(index)}
          className={`${index < 6 ? "civitas-enter " : ""}despesas-table-row ${
            // Destaque pendentes (A pagar/Atrasada) para facilitar a leitura.
            isPendingDespesa(despesa.situacao) ? "despesas-table-row--pending " : ""
          }rounded-sm bg-[var(--surface-elevated)] shadow-[var(--shadow-xs)] ring-1 ring-[var(--border-soft)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-subtle)] hover:shadow-[var(--shadow-sm)]`}
        >
          <td className="px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
            {getDespesaCodigo(despesa)}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.tipoCodigoNome}
          </td>
          <td className="px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.raw.consumoPrevisto != null ? despesa.raw.consumoPrevisto : "-"}
          </td>
          <td className="px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.categoria}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm text-[var(--foreground-muted)]">
            {despesa.descricao}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
            {despesa.valorFormatado}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm text-[var(--foreground-muted)]">
            {despesa.dataFormatada}
          </td>
          <td className="despesas-table-cell px-4 py-5">
            <span
              className={`despesas-table-status-badge civitas-badge min-w-[84px] ${getStatusBadgeClassName(
                despesa.situacao
              )}`}
            >
              {despesa.situacaoLabel}
            </span>
          </td>
          <td className="despesas-table-cell rounded-sm px-4 py-5">
            <RowActions
              despesa={despesa}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onPayment={onPayment}
            />
          </td>
        </tr>
      ))}
    </>
  );
}

function RowActions({
  despesa,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: Omit<DespesasTabelaRowsProps, "loading" | "despesas" | "hasLocalListSearch"> & {
  despesa: DespesaDashboardRow;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onView(despesa)}
        className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
        aria-label={`Visualizar ${despesa.registro}`}
      >
        <span className="material-symbols-outlined !text-[18px]">visibility</span>
      </button>
      <button
        type="button"
        onClick={() => onEdit(despesa)}
        className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
        aria-label={`Editar ${despesa.registro}`}
      >
        <span className="material-symbols-outlined !text-[18px]">edit</span>
      </button>
      <button
        type="button"
        onClick={() => onPayment(despesa)}
        className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
        aria-label={`Atualizar pagamento ${despesa.registro}`}
      >
        {/* Acao dedicada ao fluxo de pagamento */}
        <span className="material-symbols-outlined !text-[18px]">payments</span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(despesa)}
        className="despesas-table-action despesas-table-action--danger flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--status-inactive-text)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-danger-soft)] hover:shadow-[var(--shadow-sm)]"
        aria-label={`Remover ${despesa.registro}`}
      >
        <span className="material-symbols-outlined !text-[18px]">delete</span>
      </button>
    </div>
  );
}

const getEnterDelayStyle = (index: number): React.CSSProperties | undefined => {
  if (index >= 6) return undefined;
  return { ["--enter-delay" as string]: `${index * 45}ms` } as React.CSSProperties;
};
