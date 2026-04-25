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


  const getMotionStyle = (index: number): React.CSSProperties | undefined => {
    if (index > 5) return undefined;

    return {
      ["--enter-delay" as string]: `${index * 45}ms`,
    };
  };

  const getStatusValue = (objeto: T) => {
    const record = toRecord(objeto);
    return record.status ?? record.situacao ?? record.ativo ?? record.estado ?? null;
  };

  const isStatusColumn = (columnId: string) => {
    const normalized = columnId.toLowerCase();
    return (
      normalized === "status" ||
      normalized === "statuslabel" ||
      normalized === "situacao" ||
      normalized === "situacaolabel"
    );
  };
  const renderStatusBadge = (status: unknown) => {
    const baseStatusText = getStatusText(status);
    if (!baseStatusText) return null;

    let classes = "civitas-badge min-w-[74px]";
    let statusText = baseStatusText;
    const normalized = baseStatusText.trim().toLowerCase();

    if (normalized === "ativo" || normalized === "true" || normalized === "sim" || normalized === "1") {
      classes += " civitas-badge--status-active";
      statusText = "Ativo";
    } else if (normalized === "inativo" || normalized === "false" || normalized === "nao" || normalized === "0") {
      classes += " civitas-badge--status-inactive";
      statusText = "Inativo";
    } else {
      classes += " civitas-badge--status-neutral";
      statusText = String(status);
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

    if (column.id.toLowerCase() === "id" || column.id.toLowerCase().startsWith("id")) {
      return (
        <span className="inline-flex min-w-[82px] justify-center rounded-full border border-[#E3CB73] bg-[linear-gradient(135deg,#FFE38A_0%,#F7D447_100%)] px-4 py-[7px] text-sm font-bold leading-none text-[#2A2A2A] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          #{String(cellText).padStart(3, "0")}
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

  const actionButtonClassName =
    "civitas-table__action flex h-10 w-10 cursor-pointer items-center justify-center rounded-[14px] border bg-[rgba(255,255,255,0.92)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-4";

  const renderActionButton = (
    icon: string,
    action: FormMode,
    objeto: T,
    tone: "default" | "danger" = "default"
  ) => {
    const toneClassName =
      tone === "danger"
        ? "border-[#F1D7D7] text-[#D06B6B] hover:bg-[#FFF8F8] focus-visible:ring-[#FF8A8A]/20"
        : "border-[var(--border-soft)] text-[var(--secundary-1)] hover:bg-[var(--surface-subtle)] focus-visible:ring-[var(--focus-ring)]";

    return (
      <button
        type="button"
        onClick={() => openModal(action, objeto)}
        className={`${actionButtonClassName} ${toneClassName}`}
      >
        <span className="material-symbols-outlined !text-[21px]">{icon}</span>
      </button>
    );
  };

  return (
    <div className="civitas-table civitas-table-shell civitas-enter mt-5 w-full">
      {!isLoading && !errorMessage && data.length > 0 ? (
        <>
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto px-4 py-5 sm:px-5 lg:px-6">
              <table className="min-w-[920px] w-full border-separate border-spacing-y-[10px] text-left text-[var(--foreground)]">
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
                  {data.map((objeto, index) => (
                    <tr
                      key={index}
                      style={getMotionStyle(index)}
                      className="civitas-table__row civitas-enter overflow-hidden rounded-[22px] bg-[rgba(255,255,255,0.96)] shadow-[var(--shadow-xs)] ring-1 ring-[#DCEBEC] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[#FCFEFE] hover:shadow-[var(--shadow-sm)] hover:ring-[#CFE2E5]"
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={column.id}
                          className={`civitas-table__cell break-words border-y border-transparent px-5 py-[16px] align-middle text-[15px] font-medium text-[var(--foreground)] ${
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
                              renderActionButton("visibility", "view", objeto)
                            ) : null}

                            {resolvedActions.includes("edit") ? (
                              renderActionButton("edit", "edit", objeto)
                            ) : null}

                            {resolvedActions.includes("delete") ? (
                              renderActionButton("delete", "delete", objeto, "danger")
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
                    style={getMotionStyle(index)}
                    className="civitas-table__card civitas-enter rounded-[22px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.96)] p-4 shadow-[var(--shadow-xs)]"
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
                            <span className="civitas-table__meta text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                              {column.label}
                            </span>
                            <span className="civitas-table__cell break-words text-[15px] font-medium text-[var(--foreground)]">
                              {renderCellValue(objeto, column)}
                            </span>
                          </div>
                        ))}
                    </div>

                    {hasActions ? (
                      <div className="mt-4 flex items-center justify-end gap-2">
                        {resolvedActions.includes("view") ? (
                          renderActionButton("visibility", "view", objeto)
                        ) : null}

                        {resolvedActions.includes("edit") ? (
                          renderActionButton("edit", "edit", objeto)
                        ) : null}

                        {resolvedActions.includes("delete") ? (
                          renderActionButton("delete", "delete", objeto, "danger")
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
