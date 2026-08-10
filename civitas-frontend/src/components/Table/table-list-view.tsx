import type React from "react";
import type { TableColumn } from "./export-types";
import { getMotionStyle } from "./table-record";
import type { TableRow } from "./table-types";
import type { TableSortState } from "./use-table-sort";

type TableListViewProps<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  hasActions: boolean;
  sortState: TableSortState | null;
  renderCellValue: (row: T, column: TableColumn) => React.ReactNode;
  renderActions: (row: T) => React.ReactNode;
  onSortChange: (columnId: string) => void;
};

export function TableListView<T extends TableRow>({
  data,
  columns,
  hasActions,
  sortState,
  renderCellValue,
  renderActions,
  onSortChange,
}: TableListViewProps<T>) {
  const getSortIcon = (columnId: string) => {
    if (sortState?.columnId !== columnId) return "unfold_more";
    return sortState.direction === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
  };

  return (
    <div className="w-full overflow-x-auto px-4 py-4 sm:px-5 lg:px-6">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-[10px] text-left text-[var(--foreground)] lg:min-w-[860px]">
        <thead>
          <tr className="civitas-table__head text-[12px] font-semibold uppercase text-[var(--foreground-soft)]">
            {columns.map((column) => (
              <th key={column.id} className="px-5 py-2.5">
                <button
                  type="button"
                  onClick={() => onSortChange(column.id)}
                  className="flex min-h-[32px] items-center gap-2 text-left font-semibold uppercase text-[var(--foreground)] transition hover:text-[var(--primary-1)]"
                  aria-label={`Ordenar por ${column.label}`}
                >
                  <span>{column.label}</span>
                  <span className="material-symbols-outlined !text-[18px]">{getSortIcon(column.id)}</span>
                </button>
              </th>
            ))}
            {hasActions ? <th className="px-5 py-2.5 text-right">Acoes</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={getMotionStyle(rowIndex)}
              className="civitas-table__row civitas-enter overflow-hidden rounded-sm bg-[var(--surface-elevated)] ring-1 ring-[var(--border-soft)] transition-all duration-[var(--motion-duration-fast)] hover:bg-[var(--surface-subtle)] hover:ring-[var(--border-default)]"
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={column.id}
                  className={`civitas-table__cell break-words border-y border-transparent px-5 py-[14px] align-middle text-sm font-medium text-[var(--foreground)] ${columnIndex === 0 ? "rounded-sm" : ""}`}
                >
                  {renderCellValue(row, column)}
                </td>
              ))}
              {hasActions ? (
                <td className="rounded-sm px-5 py-[14px] align-middle">
                  <div className="flex items-center justify-end gap-2">{renderActions(row)}</div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
