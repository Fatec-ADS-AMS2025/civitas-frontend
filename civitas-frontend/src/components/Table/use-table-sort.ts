import { useMemo, useState } from "react";
import type { TableColumn } from "./export-types";
import { getTableCellText } from "./export-utils";
import type { TableRow } from "./table-types";

export type TableSortDirection = "asc" | "desc";

export type TableSortState = {
  columnId: string;
  direction: TableSortDirection;
};

const parseComparableNumber = (value: string) => {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const compareText = (left: string, right: string) => {
  const leftNumber = parseComparableNumber(left);
  const rightNumber = parseComparableNumber(right);

  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right, "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
};

export function useTableSort<T extends TableRow>(data: T[], columns: TableColumn[]) {
  const [sortState, setSortState] = useState<TableSortState | null>(null);

  const sortedData = useMemo(() => {
    if (!sortState) return data;

    const column = columns.find((item) => item.id === sortState.columnId);
    if (!column) return data;

    return [...data].sort((left, right) => {
      const result = compareText(getTableCellText(left, column), getTableCellText(right, column));
      return sortState.direction === "asc" ? result : -result;
    });
  }, [columns, data, sortState]);

  const toggleSort = (columnId: string) => {
    setSortState((current) =>
      current?.columnId === columnId
        ? { columnId, direction: current.direction === "asc" ? "desc" : "asc" }
        : { columnId, direction: "asc" }
    );
  };

  return {
    sortedData,
    sortState,
    toggleSort,
    clearSort: () => setSortState(null),
  };
}
