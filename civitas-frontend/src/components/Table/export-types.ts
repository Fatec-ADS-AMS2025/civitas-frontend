export type TableColumn = {
  id: string;
  label: string;
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
