import type React from "react";
import { InfoCard, type InfoListItem } from "@/components/DataDisplay";
import type { TableColumn } from "./export-types";
import { getTableCellText, isStatusColumn } from "./export-utils";
import { getRouteCardConfig } from "./table-card-presets";
import type { TableCardConfig, TableCardField, TableCardValue, TableRow } from "./table-types";

type TableCardViewProps<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  pageKey: string;
  cardConfig?: TableCardConfig<T>;
  renderCellValue: (row: T, column: TableColumn) => React.ReactNode;
  renderActions: (row: T) => React.ReactNode;
};

const resolveCardValue = <T extends TableRow>(
  value: TableCardValue<T> | undefined,
  row: T,
  fallback?: React.ReactNode,
): React.ReactNode => (typeof value === "function" ? value(row) : (value ?? fallback));

const buildDefaultFields = <T extends TableRow>(columns: TableColumn[]) => {
  const statusColumn = columns.find((column) => isStatusColumn(column.id));

  return columns
    .filter((column, index) => index > 0 && column.id !== statusColumn?.id)
    .slice(0, 4)
    .map<TableCardField<T>>((column) => ({
      label: column.label,
      columnId: column.id,
    }));
};

export function TableCardView<T extends TableRow>({
  data,
  columns,
  pageKey,
  cardConfig,
  renderCellValue,
  renderActions,
}: TableCardViewProps<T>) {
  const resolvedConfig = cardConfig ?? getRouteCardConfig<T>(pageKey);
  const statusColumn =
    columns.find((column) => column.id === resolvedConfig?.badgeColumnId) ??
    columns.find((column) => isStatusColumn(column.id));
  const titleColumn = columns[0];
  const subtitleColumn = columns.find((column, index) => index > 0 && !isStatusColumn(column.id));
  const primaryFields = resolvedConfig?.primaryFields ?? buildDefaultFields<T>(columns);
  const gridClassName = resolvedConfig?.gridClassName ?? "grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3";

  const resolveField = (row: T, field: TableCardField<T>): InfoListItem => {
    const column = columns.find((item) => item.id === field.columnId);

    return {
      label: field.label,
      icon: field.icon,
      tone: field.tone,
      helper: resolveCardValue(field.helper, row),
      value: resolveCardValue(field.value, row, column ? renderCellValue(row, column) : "-"),
    };
  };

  return (
    <div className={`grid gap-4 ${gridClassName}`}>
      {data.map((row, index) => (
        <InfoCard
          key={index}
          eyebrow={resolveCardValue(resolvedConfig?.eyebrow, row)}
          title={resolveCardValue(
            resolvedConfig?.title,
            row,
            titleColumn ? renderCellValue(row, titleColumn) : "Registro",
          )}
          subtitle={resolveCardValue(
            resolvedConfig?.subtitle,
            row,
            subtitleColumn ? getTableCellText(row, subtitleColumn) : undefined,
          )}
          badge={resolveCardValue(
            resolvedConfig?.badge,
            row,
            statusColumn ? renderCellValue(row, statusColumn) : undefined,
          )}
          icon={resolvedConfig?.icon}
          tone={resolvedConfig?.tone}
          primaryItems={primaryFields.map((field) => resolveField(row, field))}
          secondaryItems={(resolvedConfig?.secondaryFields ?? []).map((field) => resolveField(row, field))}
          relationshipItems={(resolvedConfig?.relationshipFields ?? []).map((field) => resolveField(row, field))}
          footerItems={(resolvedConfig?.footerFields ?? []).map((field) => resolveField(row, field))}
          actions={renderActions(row)}
        />
      ))}
    </div>
  );
}
