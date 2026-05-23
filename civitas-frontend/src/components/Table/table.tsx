import React, { useState } from "react";
import { usePathname } from "next/navigation";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback-states";
import type { FormMode } from "../Form/form";
import ExportModal from "./export-modal";
import { renderCellValue } from "./table-cell";
import { getRouteCardConfig } from "./table-card-presets";
import { TableCardView } from "./table-card-view";
import { TableListView } from "./table-list-view";
import { TableActions } from "./table-actions";
import { TableModal } from "./table-modal";
import { useTableExport } from "./use-table-export";
import type { TableDisplayMode, TableProps, TableRow } from "./table-types";

export type {
  TableCardConfig,
  TableCardField,
  TableDisplayMode,
  TablePaginationConfig,
  TableProps,
} from "./table-types";

const getPageName = (pathname: string) => {
  const paths = pathname.split("/").filter(Boolean);
  return paths[paths.length - 1] ?? "";
};

const resolveDisplayMode = <T extends TableRow>(
  pageName: string,
  displayMode?: TableDisplayMode,
  hasExplicitCardConfig?: boolean
): TableDisplayMode => {
  if (displayMode) return displayMode;
  return hasExplicitCardConfig || getRouteCardConfig<T>(pageName) ? "cards" : "table";
};

const Table = <T extends TableRow,>({
  data,
  columns,
  onEdit,
  onDelete,
  renderModalExtra,
  actions,
  formFields,
  formValidationSchema,
  formHiddenFields,
  isLoading = false,
  loadingTitle,
  emptyTitle,
  emptyDescription,
  errorMessage,
  onRetry,
  paginationEnabled,
  pagination,
  exportConfig,
  displayMode,
  cardConfig,
}: TableProps<T>) => {
  const pathname = usePathname() || "";
  const pageName = getPageName(pathname);
  const resolvedActions = actions ?? (onDelete ? ["edit", "view", "delete"] : ["edit", "view"]);
  const hasActions = resolvedActions.length > 0;
  const viewMode = resolveDisplayMode<T>(pageName, displayMode, Boolean(cardConfig));
  const [modalAction, setModalAction] = useState<FormMode | null>(null);
  const [selectedContent, setSelectedContent] = useState<T | null>(null);
  const tableExport = useTableExport({
    data,
    columns,
    exportConfig,
    isLoading,
    errorMessage,
    pageName,
  });

  const openModal = (action: FormMode, row: T) => {
    setSelectedContent(row);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedContent(null);
  };

  const renderActions = (row: T) => (
    <TableActions row={row} actions={resolvedActions} onOpen={openModal} />
  );

  const renderData = () => {
    if (isLoading || errorMessage || data.length === 0) return null;

    if (viewMode === "cards") {
      return (
        <div className="px-4 py-4 sm:px-5 lg:px-6">
          <TableCardView
            data={data}
            columns={columns}
            pageKey={pageName}
            cardConfig={cardConfig}
            renderCellValue={renderCellValue}
            renderActions={renderActions}
          />
        </div>
      );
    }

    return (
      <TableListView
        data={data}
        columns={columns}
        hasActions={hasActions}
        renderCellValue={renderCellValue}
        renderActions={renderActions}
      />
    );
  };

  return (
    <div className="civitas-table civitas-table-shell civitas-enter mt-4 w-full">
      {renderData()}

      {tableExport.shouldShowExportAction ? (
        <div className="flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-4 sm:flex-row sm:items-center sm:justify-start sm:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => tableExport.setIsExportModalOpen(true)}
            className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-2.5 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
          >
            <span className="material-symbols-outlined text-base text-[var(--foreground)]">
              print
            </span>
            Exportar / Imprimir
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="p-4 lg:p-6">
          <LoadingState title={loadingTitle} rows={5} cols={Math.max(columns.length, 4)} />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="p-4 lg:p-6">
          <ErrorState description={errorMessage} onRetry={onRetry} />
        </div>
      ) : null}

      {!isLoading && !errorMessage && data.length === 0 ? (
        <div className="p-4 lg:p-6">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : null}

      {!isLoading && !errorMessage && data.length > 0 && paginationEnabled && pagination ? (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          disabled={isLoading}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      ) : null}

      <TableModal
        data={data}
        pageName={pageName}
        action={modalAction}
        row={selectedContent}
        formFields={formFields}
        formValidationSchema={formValidationSchema}
        formHiddenFields={formHiddenFields}
        renderModalExtra={renderModalExtra}
        onClose={closeModal}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {tableExport.exportEnabled ? (
        <ExportModal
          open={tableExport.isExportModalOpen}
          title={tableExport.exportTitle}
          columns={tableExport.exportColumns}
          filteredCount={data.length}
          allCount={tableExport.exportAllData.length}
          isGenerating={tableExport.isExporting}
          onClose={() => tableExport.setIsExportModalOpen(false)}
          onGenerate={tableExport.handleExport}
        />
      ) : null}
    </div>
  );
};

export default Table;
