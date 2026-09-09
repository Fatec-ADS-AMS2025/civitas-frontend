import type { TableColumn } from "./export-types";
import { getStatusText, getStatusValue, getTableCellText, isStatusColumn } from "./export-utils";
import { toRecord } from "./table-record";
import type { TableRow } from "./table-types";

export const renderStatusBadge = (status: unknown) => {
  const baseStatusText = getStatusText(status);
  if (!baseStatusText) return null;

  let classes = "civitas-badge min-w-[74px]";
  let statusText = baseStatusText;
  const normalized = baseStatusText.trim().toLowerCase();

  if (["ativo", "true", "sim", "1"].includes(normalized)) {
    classes += " civitas-badge--status-active";
    statusText = "Ativo";
  } else if (["inativo", "false", "nao", "0"].includes(normalized)) {
    classes += " civitas-badge--status-inactive";
    statusText = "Inativo";
  } else {
    classes += " civitas-badge--status-neutral";
    statusText = String(status);
  }

  return <span className={classes}>{statusText}</span>;
};

export const renderCellValue = <T extends TableRow>(row: T, column: TableColumn) => {
  const record = toRecord(row);

  if (isStatusColumn(column.id)) {
    const statusValue =
      record[column.id] !== undefined && record[column.id] !== null && record[column.id] !== ""
        ? record[column.id]
        : getStatusValue(row);

    return renderStatusBadge(statusValue) ?? "-";
  }

  const cellText = getTableCellText(row, column);

  if (column.id.toLowerCase() === "id" || column.id.toLowerCase().startsWith("id")) {
    return (
      <span className="civitas-chip civitas-chip--amber min-w-[74px] justify-center px-3 py-1.5 text-xs leading-none">
        #{String(cellText).padStart(3, "0")}
      </span>
    );
  }

  return cellText;
};
