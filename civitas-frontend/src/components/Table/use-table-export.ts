import { useMemo, useState } from "react";
import { showToast } from "@/hooks/useToast";
import { exportTableData, getSelectedColumns } from "./export-utils";
import type { TableColumn, TableExportConfig, TableExportOptions } from "./export-types";
import type { TableRow } from "./table-types";

type UseTableExportParams<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  exportConfig?: TableExportConfig<T>;
  isLoading: boolean;
  errorMessage?: string | null;
  pageName: string;
};

export function useTableExport<T extends TableRow>({
  data,
  columns,
  exportConfig,
  isLoading,
  errorMessage,
  pageName,
}: UseTableExportParams<T>) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportEnabled = exportConfig?.enabled ?? true;
  const exportAllData = exportConfig?.allData ?? data;
  const exportTitle = exportConfig?.title?.trim() || pageName || "Exportacao";
  const exportFileName = exportConfig?.fileName?.trim() || pageName || "exportacao";
  const exportColumns = useMemo(
    () => columns.filter((column) => column.id.trim() !== ""),
    [columns]
  );
  const shouldShowExportAction =
    exportEnabled && !isLoading && !errorMessage && exportAllData.length > 0;

  const handleExport = async ({ outputType, scope, selectedColumnIds }: TableExportOptions) => {
    const rows = scope === "all" ? exportAllData : data;
    const selectedColumns = getSelectedColumns(exportColumns, selectedColumnIds);

    try {
      setIsExporting(true);
      await exportTableData({
        outputType,
        title: exportTitle,
        fileName: exportFileName,
        rows,
        columns: selectedColumns,
      });
      showToast("Arquivo gerado com sucesso.", "success");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Erro ao exportar listagem.", error, {
        title: exportTitle,
        fileName: exportFileName,
        outputType,
        scope,
        selectedColumnIds,
      });
      showToast("Nao foi possivel gerar o arquivo. Tente novamente.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportEnabled,
    exportColumns,
    exportTitle,
    exportFileName,
    exportAllData,
    isExporting,
    isExportModalOpen,
    setIsExportModalOpen,
    shouldShowExportAction,
    handleExport,
  };
}
