import React from "react";
import type { TableColumn } from "./export-types";
import { isStatusColumn } from "./export-utils";
import { getMotionStyle } from "./table-record";
import type { TableRow } from "./table-types";

type TableListViewProps<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  hasActions: boolean;
  renderCellValue: (row: T, column: TableColumn) => React.ReactNode;
  renderActions: (row: T) => React.ReactNode;
};

export function TableListView<T extends TableRow>({
  data,
  columns,
  hasActions,
  renderCellValue,
  renderActions,
}: TableListViewProps<T>) {
  return (
    <>
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto px-4 py-4 sm:px-5 lg:px-6">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-[10px] text-left text-[var(--foreground)] lg:min-w-[860px]">
            <thead>
              <tr className="civitas-table__head text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                {columns.map((column) => (
                  <th key={column.id} className="px-5 py-2.5">
                    {column.label}
                  </th>
                ))}
                {hasActions ? <th className="px-5 py-2.5 text-center">Acoes</th> : null}
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
                      <div className="flex items-center justify-center gap-2">
                        {renderActions(row)}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="block md:hidden">
        <div className="space-y-4 p-4">
          {data.map((row, index) => {
            const statusColumn = columns.find((column) => isStatusColumn(column.id));

            return (
              <div
                key={index}
                style={getMotionStyle(index)}
                className="civitas-table__card civitas-enter rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 break-words">
                    {columns[0] ? renderCellValue(row, columns[0]) : null}
                  </div>
                  <div>{statusColumn ? renderCellValue(row, statusColumn) : null}</div>
                </div>
                <div className="space-y-2">
                  {columns
                    .slice(1)
                    .filter((column) => !isStatusColumn(column.id))
                    .map((column) => (
                      <div key={column.id} className="flex flex-col">
                        <span className="civitas-table__meta text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                          {column.label}
                        </span>
                        <span className="civitas-table__cell break-words text-[15px] font-medium text-[var(--foreground)]">
                          {renderCellValue(row, column)}
                        </span>
                      </div>
                    ))}
                </div>
                {hasActions ? (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    {renderActions(row)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
