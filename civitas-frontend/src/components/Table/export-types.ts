import type { ReactNode } from "react";

export type TableColumn = {
  id: string;
  label: string;
  sortable?: boolean;
  sortType?: "auto" | "string" | "number" | "date";
  render?: (row: Record<string, unknown>) => ReactNode;
  sortValue?: (row: Record<string, unknown>) => unknown;
};

export type TableExportOutputType = "xlsx" | "pdf";

export type TableExportScope = "filtered" | "all";

export type TableExportConfig<T extends object> = {
  enabled?: boolean;
  title?: string;
  fileName?: string;
  allData?: T[];
};

export type TableExportOptions = {
  outputType: TableExportOutputType;
  scope: TableExportScope;
  selectedColumnIds: string[];
};
