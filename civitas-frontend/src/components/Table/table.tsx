import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Form from "../Form/form";
import Modal from "../modal";
import type { FieldConfig as ModalFieldConfig, FormMode, ValidationFn } from "../Form/form";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback-states";
import { showToast } from "@/hooks/useToast";
import ExportModal from "./export-modal";
import {
  exportTableData,
  getSelectedColumns,
  getStatusText,
  getStatusValue,
  getTableCellText,
  isStatusColumn,
} from "./export-utils";
import type { TableColumn, TableExportConfig } from "./export-types";

type TableRow = object;

export type TablePaginationConfig = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

type BaseTableProps<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  actions?: string[];
  onEdit?: (id: number, data: Partial<T> & Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: number) => Promise<void>;
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
  isLoading?: boolean;
  loadingTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  exportConfig?: TableExportConfig<T>;
};

export type TableProps<T extends TableRow> = BaseTableProps<T> &
  (
    | {
        paginationEnabled: true;
        pagination: TablePaginationConfig;
      }
    | {
        paginationEnabled?: false;
        pagination?: TablePaginationConfig;
      }
  );

const Table = <T extends TableRow,>({
  data,
  columns,
  onEdit,
  onDelete,
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
}: TableProps<T>) => {
  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];
  const resolvedActions = actions ?? (onDelete ? ["edit", "view", "delete"] : ["edit", "view"]);
  const hasActions = resolvedActions.length > 0;

  const [modalAction, setModalAction] = useState<FormMode | null>(null);
  const [selectedContent, setSelectedContent] = useState<T | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportEnabled = exportConfig?.enabled ?? true;
  const exportAllData = exportConfig?.allData ?? data;
  const exportTitle = exportConfig?.title?.trim() || nomePagina || "Exportacao";
  const exportFileName = exportConfig?.fileName?.trim() || nomePagina || "exportacao";
  const hasExportData = exportAllData.length > 0;
  const shouldShowExportAction =
    exportEnabled && !isLoading && !errorMessage && hasExportData;
  const exportColumns = useMemo(() => columns.filter((column) => column.id.trim() !== ""), [columns]);

  const toRecord = (value: T): Record<string, unknown> => value as Record<string, unknown>;

  const getIdField = (obj: T): string => {
    const record = toRecord(obj);

    if (record.id !== undefined) return "id";
    if (record.idSecretaria !== undefined) return "idSecretaria";
    if (record.idFornecedor !== undefined) return "idFornecedor";
    if (record.idOrcamento !== undefined) return "idOrcamento";
    return "id";
  };

  const getResolvedId = (obj: T): number => {
    const record = toRecord(obj);
    const idField = getIdField(obj);
    const rawValue = record[idField];
    const resolvedId = typeof rawValue === "number" ? rawValue : Number(rawValue);

    if (!Number.isFinite(resolvedId)) {
      throw new Error("ID invalido para a operacao.");
    }

    return resolvedId;
  };

  const openModal = (action: FormMode, objeto: T) => {
    setSelectedContent(objeto);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedContent(null);
  };

  const renderStatusBadge = (status: unknown) => {
    const statusText = getStatusText(status);
    if (!statusText) return null;

    let classes =
      "inline-flex min-w-[64px] justify-center rounded-full px-3 py-[6px] text-[11px] font-bold leading-none";

    if (statusText === "Ativo") {
      classes += " bg-green-600 text-white";
    } else if (statusText === "Inativo") {
      classes += " bg-red-600 text-white";
    } else {
      classes += " bg-gray-300 text-black";
    }

    return <span className={classes}>{statusText}</span>;
  };

  const renderCellValue = (objeto: T, column: TableColumn) => {
    const record = toRecord(objeto);

    if (isStatusColumn(column.id)) {
      const statusValue =
        record[column.id] !== undefined && record[column.id] !== null && record[column.id] !== ""
          ? record[column.id]
          : getStatusValue(objeto);

      return renderStatusBadge(statusValue) ?? "-";
    }

    const cellText = getTableCellText(objeto, column);

    if (column.id.toLowerCase() === "id" && cellText !== "-") {
      return (
        <span className="inline-flex min-w-[74px] justify-center rounded-full bg-[#F7D21A] px-4 py-[7px] text-sm font-bold leading-none text-black">
          {cellText}
        </span>
      );
    }

    return cellText;
  };

  const handleExport = async ({
    outputType,
    scope,
    selectedColumnIds,
  }: {
    outputType: "xlsx" | "pdf";
    scope: "filtered" | "all";
    selectedColumnIds: string[];
  }) => {
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
        filteredCount: data.length,
        allCount: exportAllData.length,
      });
      showToast("Nao foi possivel gerar o arquivo. Tente novamente.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="civitas-table mt-5 w-full overflow-hidden rounded-[28px] border border-[#E4EEF0] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
      {shouldShowExportAction ? (
        <div className="flex flex-col gap-3 border-b border-[#E4EEF0] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D5E3E6] bg-white px-5 py-2.5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] sm:w-auto"
          >
            <span className="material-symbols-outlined text-base text-[#1F2A32]">print</span>
            Exportar / Imprimir
          </button>
        </div>
      ) : null}

      {!isLoading && !errorMessage && data.length > 0 ? (
        <>
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto px-4 py-5 sm:px-5 lg:px-6">
              <table className="min-w-[920px] w-full border-separate border-spacing-y-[14px] text-left text-black">
                <thead>
                  <tr className="civitas-table__head text-[13px] font-semibold uppercase tracking-[0.04em] text-[#95A5AA]">
                    {columns.map((column) => (
                      <th key={column.id} className="px-5 py-2">
                        {column.label}
                      </th>
                    ))}
                    {hasActions ? <th className="px-5 py-2 text-center">Acoes</th> : null}
                  </tr>
                </thead>

                <tbody>
                  {data.map((objeto, index) => (
                    <tr
                      key={index}
                      className="civitas-table__row overflow-hidden rounded-[20px] bg-white shadow-none ring-1 ring-[#D9EFF1] transition-colors hover:bg-[#FBFDFD]"
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={column.id}
                          className={`civitas-table__cell break-words px-5 py-[16px] align-middle text-[15px] font-medium text-[#333333] ${
                            columnIndex === 0 ? "rounded-l-[20px]" : ""
                          }`}
                        >
                          {renderCellValue(objeto, column)}
                        </td>
                      ))}

                      {hasActions ? (
                        <td className="rounded-r-[20px] px-5 py-[16px] align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {resolvedActions.includes("view") ? (
                              <button
                                type="button"
                                onClick={() => openModal("view", objeto)}
                                className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#58AFAE]/20"
                              >
                                <span className="material-symbols-outlined !text-[22px]">visibility</span>
                              </button>
                            ) : null}

                            {resolvedActions.includes("edit") ? (
                              <button
                                type="button"
                                onClick={() => openModal("edit", objeto)}
                                className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#58AFAE]/20"
                              >
                                <span className="material-symbols-outlined !text-[22px]">edit</span>
                              </button>
                            ) : null}

                            {resolvedActions.includes("delete") ? (
                              <button
                                type="button"
                                onClick={() => openModal("delete", objeto)}
                                className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#F2E2E2] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF8A8A]/20"
                              >
                                <span className="material-symbols-outlined !text-[22px]">delete</span>
                              </button>
                            ) : null}
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
              {data.map((objeto, index) => {
                const statusColumn = columns.find((column) => isStatusColumn(column.id));

                return (
                  <div
                    key={index}
                    className="civitas-table__card rounded-[20px] border border-[#DDEEEF] bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 break-words">
                        {columns[0] ? renderCellValue(objeto, columns[0]) : null}
                      </div>
                      <div>{statusColumn ? renderCellValue(objeto, statusColumn) : null}</div>
                    </div>

                    <div className="space-y-2">
                      {columns
                        .slice(1)
                        .filter((column) => !isStatusColumn(column.id))
                        .map((column) => (
                          <div key={column.id} className="flex flex-col">
                            <span className="civitas-table__meta text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]">
                              {column.label}
                            </span>
                            <span className="civitas-table__cell break-words text-[15px] font-medium text-[#1F1F1F]">
                              {renderCellValue(objeto, column)}
                            </span>
                          </div>
                        ))}
                    </div>

                    {hasActions ? (
                      <div className="mt-4 flex items-center justify-end gap-2">
                        {resolvedActions.includes("view") ? (
                          <button
                            type="button"
                            onClick={() => openModal("view", objeto)}
                            className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#58AFAE]/20"
                          >
                            <span className="material-symbols-outlined !text-[22px]">visibility</span>
                          </button>
                        ) : null}

                        {resolvedActions.includes("edit") ? (
                          <button
                            type="button"
                            onClick={() => openModal("edit", objeto)}
                            className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#58AFAE]/20"
                          >
                            <span className="material-symbols-outlined !text-[22px]">edit</span>
                          </button>
                        ) : null}

                        {resolvedActions.includes("delete") ? (
                          <button
                            type="button"
                            onClick={() => openModal("delete", objeto)}
                            className="civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#F2E2E2] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF8A8A]/20"
                          >
                            <span className="material-symbols-outlined !text-[22px]">delete</span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </>
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

      {modalAction && selectedContent ? (
        <Modal setValue={closeModal} value={modalAction != null}>
          <Form
            object={selectedContent}
            name={nomePagina}
            camps={data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : []}
            type={modalAction}
            fields={formFields}
            validationSchema={formValidationSchema}
            hiddenFields={formHiddenFields}
            onCancel={closeModal}
            onConfirm={async (formData) => {
              try {
                if (modalAction === "delete") {
                  const confirmDelete = window.confirm(`Tem certeza que deseja excluir este ${nomePagina}?`);
                  if (!confirmDelete) return;

                  if (onDelete) {
                    await onDelete(getResolvedId(selectedContent));
                  }
                } else if (modalAction === "edit" && onEdit) {
                  await onEdit(
                    getResolvedId(selectedContent),
                    formData as Partial<T> & Record<string, unknown>
                  );
                }

                closeModal();
              } catch (modalError) {
                const message =
                  modalError instanceof Error ? modalError.message : "Erro na operacao. Tente novamente.";
                showToast(message, "error");
              }
            }}
          />
        </Modal>
      ) : null}

      {exportEnabled ? (
        <ExportModal
          open={isExportModalOpen}
          title={exportTitle}
          columns={exportColumns}
          filteredCount={data.length}
          allCount={exportAllData.length}
          isGenerating={isExporting}
          onClose={() => setIsExportModalOpen(false)}
          onGenerate={handleExport}
        />
      ) : null}
    </div>
  );
};

export default Table;
