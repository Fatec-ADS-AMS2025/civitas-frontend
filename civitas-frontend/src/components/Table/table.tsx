import React, { useEffect, useMemo, useState } from "react";
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

type SortDirection = "asc" | "desc" | null;

type SortState = {
  columnId: string | null;
  direction: SortDirection;
};

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
  renderRowActions?: (row: T) => React.ReactNode;
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
  renderRowActions,
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
  const hasActions = Boolean(renderRowActions) || resolvedActions.length > 0;

  const [modalAction, setModalAction] = useState<FormMode | null>(null);
  const [selectedContent, setSelectedContent] = useState<T | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showColumnControls, setShowColumnControls] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    columns.map((column) => column.id)
  );
  const [sortState, setSortState] = useState<SortState>({
    columnId: null,
    direction: null,
  });

  const exportEnabled = exportConfig?.enabled ?? true;
  const exportAllData = exportConfig?.allData ?? data;
  const exportTitle = exportConfig?.title?.trim() || nomePagina || "Exportacao";
  const exportFileName = exportConfig?.fileName?.trim() || nomePagina || "exportacao";
  const hasExportData = exportAllData.length > 0;
  const shouldShowExportAction =
    exportEnabled && !isLoading && !errorMessage && hasExportData;
  const exportColumns = useMemo(() => columns.filter((column) => column.id.trim() !== ""), [columns]);

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns]);
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIds.includes(column.id)),
    [columns, visibleColumnIds]
  );

  useEffect(() => {
    setVisibleColumnIds((current) => {
      if (columnIds.length === 0) return [];

      const next = current.filter((id) => columnIds.includes(id));
      const missing = columnIds.filter((id) => !next.includes(id));
      const merged = [...next, ...missing];

      return merged.length > 0 ? merged : columnIds;
    });
  }, [columnIds]);

  useEffect(() => {
    if (!sortState.columnId) return;

    const isStillVisible = visibleColumnIds.includes(sortState.columnId);
    if (!isStillVisible) {
      setSortState({ columnId: null, direction: null });
    }
  }, [sortState.columnId, visibleColumnIds]);

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
    if (column.render) {
      return column.render(toRecord(objeto));
    }

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

  const isColumnSortable = (column: TableColumn) => column.sortable !== false;

  const parseNumberValue = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) return null;
    const digitCount = (trimmed.match(/\d/g) ?? []).length;
    if (digitCount === 0) return null;

    const letterCount = (trimmed.match(/[A-Za-z]/g) ?? []).length;
    if (letterCount >= 3 && letterCount >= digitCount) return null;

    let sanitized = trimmed.replace(/[^0-9,.-]/g, "");
    const hasComma = sanitized.includes(",");
    const hasDot = sanitized.includes(".");

    if (hasComma && hasDot) {
      if (sanitized.lastIndexOf(",") > sanitized.lastIndexOf(".")) {
        sanitized = sanitized.replace(/\./g, "").replace(",", ".");
      } else {
        sanitized = sanitized.replace(/,/g, "");
      }
    } else if (hasComma) {
      sanitized = sanitized.replace(/\./g, "").replace(",", ".");
    }

    const numeric = Number(sanitized);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const parseDateValue = (value: unknown): number | null => {
    if (value instanceof Date) {
      const timestamp = value.getTime();
      return Number.isFinite(timestamp) ? timestamp : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      const timestamp = new Date(value).getTime();
      return Number.isFinite(timestamp) ? timestamp : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
    if (isoMatch) {
      const parsed = Date.parse(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }

    const ptMatch = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);
    if (ptMatch) {
      const day = Number(ptMatch[1]);
      const month = Number(ptMatch[2]);
      const year = Number(ptMatch[3]);
      const parsed = new Date(year, month - 1, day).getTime();
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  };

  const detectSortType = (column: TableColumn, sample: T[]) => {
    if (column.sortType && column.sortType !== "auto") {
      return column.sortType;
    }

    const sampleValue = sample
      .map((row) => {
        if (column.sortValue) {
          return column.sortValue(toRecord(row));
        }

        if (isStatusColumn(column.id)) {
          return getTableCellText(row, column);
        }

        const record = toRecord(row);
        return record[column.id];
      })
      .find((value) => value !== null && value !== undefined && value !== "");

    if (sampleValue instanceof Date) return "date";
    if (typeof sampleValue === "number") return "number";

    if (typeof sampleValue === "string") {
      if (parseDateValue(sampleValue) !== null) return "date";
      if (parseNumberValue(sampleValue) !== null) return "number";
    }

    return "string";
  };

  const collator = useMemo(
    () => new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true }),
    []
  );

  const sortedData = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) {
      return data;
    }

    const activeColumn = columns.find((column) => column.id === sortState.columnId);
    if (!activeColumn || !isColumnSortable(activeColumn)) {
      return data;
    }

    const sortType = detectSortType(activeColumn, data);
    const directionFactor = sortState.direction === "asc" ? 1 : -1;

    const rowsWithIndex = data.map((row, index) => ({ row, index }));

    rowsWithIndex.sort((left, right) => {
      const leftRecord = toRecord(left.row);
      const rightRecord = toRecord(right.row);

      const leftValue = activeColumn.sortValue
        ? activeColumn.sortValue(leftRecord)
        : leftRecord[activeColumn.id] ?? getTableCellText(left.row, activeColumn);
      const rightValue = activeColumn.sortValue
        ? activeColumn.sortValue(rightRecord)
        : rightRecord[activeColumn.id] ?? getTableCellText(right.row, activeColumn);

      const leftEmpty = leftValue === null || leftValue === undefined || leftValue === "";
      const rightEmpty = rightValue === null || rightValue === undefined || rightValue === "";

      if (leftEmpty && rightEmpty) return left.index - right.index;
      if (leftEmpty) return 1;
      if (rightEmpty) return -1;

      let comparison = 0;

      if (sortType === "number") {
        const leftNumber = parseNumberValue(leftValue);
        const rightNumber = parseNumberValue(rightValue);

        if (leftNumber !== null && rightNumber !== null) {
          comparison = leftNumber - rightNumber;
        } else {
          comparison = collator.compare(String(leftValue), String(rightValue));
        }
      } else if (sortType === "date") {
        const leftDate = parseDateValue(leftValue);
        const rightDate = parseDateValue(rightValue);

        if (leftDate !== null && rightDate !== null) {
          comparison = leftDate - rightDate;
        } else {
          comparison = collator.compare(String(leftValue), String(rightValue));
        }
      } else {
        comparison = collator.compare(String(leftValue), String(rightValue));
      }

      if (comparison === 0) return left.index - right.index;

      return comparison * directionFactor;
    });

    return rowsWithIndex.map((item) => item.row);
  }, [collator, columns, data, sortState.columnId, sortState.direction]);

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumnIds((current) => {
      const isSelected = current.includes(columnId);
      if (isSelected && current.length === 1) {
        showToast("Ao menos uma coluna deve ficar visivel.", "info");
        return current;
      }

      if (isSelected) {
        return current.filter((id) => id !== columnId);
      }

      return [...current, columnId];
    });
  };

  const showAllColumns = () => {
    setVisibleColumnIds(columnIds);
  };

  const reduceToSingleColumn = () => {
    if (columnIds.length === 0) return;
    setVisibleColumnIds([columnIds[0]]);
  };

  const toggleSort = (column: TableColumn) => {
    if (!isColumnSortable(column)) return;

    setSortState((current) => {
      if (current.columnId !== column.id) {
        return { columnId: column.id, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { columnId: column.id, direction: "desc" };
      }

      return { columnId: null, direction: null };
    });
  };

  const clearSorting = () => setSortState({ columnId: null, direction: null });

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
          <div className="flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Tabela</p>
              <p className="text-xs text-[var(--foreground-soft)]">
                {visibleColumns.length} de {columns.length} colunas visiveis
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowColumnControls((prev) => !prev)}
                className="civitas-action civitas-action--ghost min-h-[40px] px-4 py-2 text-sm"
              >
                <span className="material-symbols-outlined text-base">view_column</span>
                Ocultar Colunas
              </button>
              <button
                type="button"
                onClick={clearSorting}
                disabled={!sortState.columnId}
                className="civitas-action civitas-action--ghost min-h-[40px] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">filter_list_off</span>
                Limpar ordenacao
              </button>
            </div>
          </div>

          {showColumnControls ? (
            <div className="civitas-surface-subtle civitas-enter border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Colunas visiveis</p>
                  <p className="text-xs text-[var(--foreground-soft)]">
                    {visibleColumns.length} de {columns.length} colunas selecionadas
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={showAllColumns}
                    className="civitas-action civitas-action--ghost min-h-[40px] px-4 py-2 text-sm"
                  >
                    Marcar todas
                  </button>
                  <button
                    type="button"
                    onClick={reduceToSingleColumn}
                    className="civitas-action civitas-action--ghost min-h-[40px] px-4 py-2 text-sm"
                  >
                    Somente 1
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {columns.map((column) => (
                  <label
                    key={column.id}
                    className="flex cursor-pointer items-center gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumnIds.includes(column.id)}
                      onChange={() => toggleColumnVisibility(column.id)}
                      className="h-4 w-4 accent-[var(--primary-1)]"
                    />
                    <span>{column.label}</span>
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-[var(--foreground-soft)]">
                Ao menos uma coluna deve ficar visivel.
              </p>
            </div>
          ) : null}

          <div className="w-full overflow-x-auto px-4 py-4 sm:px-5 lg:px-6">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-[10px] text-left text-[var(--foreground)] lg:min-w-[860px]">
              <thead>
                <tr className="civitas-table__head text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                  {visibleColumns.map((column) => {
                    const isActiveSort = sortState.columnId === column.id;
                    const sortDirection = isActiveSort ? sortState.direction : null;
                    const isSortable = isColumnSortable(column);
                    const sortIcon =
                      sortDirection === "asc"
                        ? "arrow_downward"
                        : sortDirection === "desc"
                          ? "arrow_upward"
                          : "unfold_more";

                    return (
                      <th
                        key={column.id}
                        className="px-5 py-2.5"
                        aria-sort={
                          isActiveSort
                            ? sortDirection === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        {isSortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column)}
                            className="group inline-flex items-center gap-2 text-left text-[var(--foreground)] transition hover:text-[var(--secundary-1)]"
                          >
                            <span>{column.label}</span>
                            <span
                              className={`material-symbols-outlined text-base ${
                                sortDirection
                                  ? "text-[var(--primary-1)]"
                                  : "text-[var(--foreground-soft)] group-hover:text-[var(--secundary-1)]"
                              }`}
                            >
                              {sortIcon}
                            </span>
                          </button>
                        ) : (
                          <span>{column.label}</span>
                        )}
                      </th>
                    );
                  })}
                  {hasActions ? <th className="px-5 py-2.5 text-center">Acoes</th> : null}
                </tr>
              </thead>

              <tbody>
                {sortedData.map((objeto, index) => (
                  <tr
                    key={index}
                    style={getMotionStyle(index)}
                    className="civitas-table__row civitas-enter overflow-hidden rounded-sm bg-[var(--surface-elevated)] ring-1 ring-[var(--border-soft)] transition-all duration-[var(--motion-duration-fast)] hover:bg-[var(--surface-subtle)] hover:ring-[var(--border-default)]"
                  >
                    {visibleColumns.map((column, columnIndex) => (
                      <td
                        key={column.id}
                        className={`civitas-table__cell break-words border-y border-transparent px-5 py-[14px] align-middle text-sm font-medium text-[var(--foreground)] ${
                          columnIndex === 0 ? "rounded-sm" : ""
                        }`}
                      >
                        {renderCellValue(objeto, column)}
                      </td>
                    ))}

                    {hasActions ? (
                      <td className="rounded-sm px-5 py-[14px] align-middle">
                        {renderRowActions ? (
                          renderRowActions(objeto)
                        ) : (
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
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
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
