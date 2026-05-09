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
  renderModalExtra?: (row: T, mode: FormMode) => React.ReactNode;
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
        <span className="civitas-chip civitas-chip--amber min-w-[74px] justify-center px-3 py-1.5 text-xs leading-none">
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
    "civitas-table__action flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4";

  const renderActionButton = (
    icon: string,
    action: FormMode,
    objeto: T,
    tone: "default" | "danger" = "default"
  ) => {
    const toneClassName =
      tone === "danger"
        ? "civitas-action--danger"
        : "border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--secundary-1)] hover:bg-[var(--surface-subtle)] focus-visible:ring-[var(--focus-ring)]";

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
    <div className="civitas-table civitas-table-shell civitas-enter mt-4 w-full">
      {!isLoading && !errorMessage && data.length > 0 ? (
        <>
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto px-4 py-4 sm:px-5 lg:px-6">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-[10px] text-left text-[var(--foreground)] lg:min-w-[860px]">
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
                      className="civitas-table__row civitas-enter overflow-hidden rounded-sm bg-[var(--surface-elevated)] ring-1 ring-[var(--border-soft)] transition-all duration-[var(--motion-duration-fast)] hover:bg-[var(--surface-subtle)] hover:ring-[var(--border-default)]"
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={column.id}
                          className={`civitas-table__cell break-words border-y border-transparent px-5 py-[14px] align-middle text-sm font-medium text-[var(--foreground)] ${columnIndex === 0 ? "rounded-sm" : ""
                            }`}
                        >
                          {renderCellValue(objeto, column)}
                        </td>
                      ))}

                      {hasActions ? (
                        <td className="rounded-sm px-5 py-[14px] align-middle">
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
                    className="civitas-table__card civitas-enter rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
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
          {shouldShowExportAction ? (
            <div className="flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-4 sm:flex-row sm:items-center sm:justify-start sm:px-5 lg:px-6">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-2.5 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-[var(--foreground)]">
                  print
                </span>
                Exportar / Imprimir
              </button>
            </div>
          ) : null}
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
            extraContent={
              renderModalExtra ? renderModalExtra(selectedContent, modalAction) : undefined
            }
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
