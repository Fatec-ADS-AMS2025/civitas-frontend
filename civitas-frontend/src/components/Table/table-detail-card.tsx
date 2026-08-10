import type React from "react";
import type { TableColumn } from "./export-types";
import { getRouteCardConfig } from "./table-card-presets";
import { TableCardView } from "./table-card-view";
import type { TableCardConfig, TableRow } from "./table-types";

type TableDetailCardProps<T extends TableRow> = {
  row: T;
  columns: TableColumn[];
  pageKey: string;
  cardConfig?: TableCardConfig<T>;
  renderCellValue: (row: T, column: TableColumn) => React.ReactNode;
};

export function TableDetailCard<T extends TableRow>({
  row,
  columns,
  pageKey,
  cardConfig,
  renderCellValue,
}: TableDetailCardProps<T>) {
  const resolvedConfig = cardConfig ?? getRouteCardConfig<T>(pageKey);
  const detailConfig: TableCardConfig<T> = {
    ...(resolvedConfig ?? {}),
    gridClassName: "grid-cols-1",
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-[var(--foreground-soft)]">Visualizacao</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">Detalhes do registro</h2>
      </div>

      <TableCardView
        data={[row]}
        columns={columns}
        pageKey={pageKey}
        cardConfig={detailConfig}
        renderCellValue={renderCellValue}
        renderActions={() => null}
      />
    </div>
  );
}
