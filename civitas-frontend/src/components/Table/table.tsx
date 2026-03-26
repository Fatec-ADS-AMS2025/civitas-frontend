import React, { useState } from "react";
import Form from "../Form/form";
import Modal from "../modal";
import type { FieldConfig as ModalFieldConfig, FormMode, ValidationFn } from "../Form/form";
import { usePathname } from "next/navigation";

type TableRow = object;

type Column = {
  id: string;
  label: string;
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
  columns: Column[];
  actions?: string[];
  onEdit?: (id: number, data: Partial<T> & Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: number) => Promise<void>;
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
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

const resolvePageSizeOptions = (pagination: TablePaginationConfig): number[] => {
  const options = pagination.pageSizeOptions ?? [];
  return Array.from(new Set([pagination.pageSize, ...options])).sort((a, b) => a - b);
};

const Table = <T extends TableRow,>({
  data,
  columns,
  onEdit,
  onDelete,
  actions,
  formFields,
  formValidationSchema,
  formHiddenFields,
  paginationEnabled,
  pagination,
}: TableProps<T>) => {
  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];
  const resolvedActions = actions ?? (onDelete ? ["edit", "view", "delete"] : ["edit", "view"]);
  const hasActions = resolvedActions.length > 0;

  const [modalAction, setModalAction] = useState<FormMode | null>(null);
  const [selectedContent, setSelectedContent] = useState<T | null>(null);

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
    if (status === null || status === undefined) return null;
    let statusText = "";

    const normalized = String(status).toLowerCase();

    let classes =
      "inline-flex min-w-[64px] justify-center rounded-full px-3 py-[6px] text-[11px] font-bold leading-none";

    if (normalized === "ativo" || normalized === "true" || normalized === "sim" || normalized === "1") {
      classes += " bg-green-600 text-white";
      statusText = "Ativo";
    } else if (
      normalized === "inativo" ||
      normalized === "false" ||
      normalized === "nao" ||
      normalized === "nï¿½o" ||
      normalized === "0"
    ) {
      classes += " bg-red-600 text-white";
      statusText = "Inativo";
    } else {
      classes += " bg-gray-300 text-black";
      statusText = String(status);
    }

    return <span className={classes}>{statusText}</span>;
  };

  const renderCellValue = (objeto: T, column: Column) => {
    const record = toRecord(objeto);

    if (isStatusColumn(column.id)) {
      const statusValue =
        record[column.id] !== undefined && record[column.id] !== null && record[column.id] !== ""
          ? record[column.id]
          : getStatusValue(objeto);

      return renderStatusBadge(statusValue) ?? "-";
    }

    const value = record[column.id];

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (column.id.toLowerCase() === "id") {
      return (
        <span className="inline-flex min-w-[74px] justify-center rounded-full bg-[#F7D21A] px-4 py-[7px] text-sm font-bold leading-none text-black">
          #{String(value).padStart(3, "0")}
        </span>
      );
    }

    return String(value);
  };

  const renderPagination = () => {
    if (!paginationEnabled || !pagination) {
      return null;
    }

    const displayCurrentPage = Math.max(pagination.currentPage, 1);
    const displayTotalPages = Math.max(pagination.totalPages, 1);
    const canGoPrevious = displayCurrentPage > 1;
    const canGoNext = displayCurrentPage < displayTotalPages;
    const pageSizeOptions = resolvePageSizeOptions(pagination);

    return (
      <div className="border-t border-[#E5EEF0] px-5 py-4 lg:px-6">
        <div className="flex flex-col gap-3 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span>{pagination.totalRecords} registros</span>
            <span className="inline-flex items-center rounded-full bg-[#F3F9FA] px-3 py-1 font-medium text-[#0B6470]">
              Pagina {displayCurrentPage} de {displayTotalPages}
            </span>

            {pagination.onPageSizeChange && pageSizeOptions.length > 0 && (
              <label className="flex items-center gap-2">
                <span>Tamanho</span>
                <select
                  value={pagination.pageSize}
                  onChange={(event) => pagination.onPageSizeChange?.(Number(event.target.value))}
                  className="rounded-2xl border border-[#D5E3E6] bg-white px-3 py-2 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => pagination.onPageChange(displayCurrentPage - 1)}
              disabled={!canGoPrevious}
              className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(displayCurrentPage + 1)}
              disabled={!canGoNext}
              className="rounded-2xl bg-[#58AFAE] px-4 py-2 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proxima
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5 w-full overflow-hidden rounded-[30px] border border-[#E4EEF0] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto px-5 py-5 lg:px-6">
          <table className="w-full border-separate border-spacing-y-[16px] text-left text-black">
            <thead>
              <tr className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#95A5AA]">
                {columns.map((column) => (
                  <th key={column.id} className="px-6 py-2">
                    {column.label}
                  </th>
                ))}
                {hasActions && <th className="px-6 py-2 text-center">Acoes</th>}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="rounded-[18px] border border-[#DDEEEF] px-4 py-6 text-center text-[#6B7280]"
                  >
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                data.map((objeto, index) => (
                  <tr
                    key={index}
                    className="overflow-hidden rounded-[20px] bg-white shadow-none ring-1 ring-[#D9EFF1] transition-colors hover:bg-[#FBFDFD]"
                  >
                    {columns.map((column, columnIndex) => (
                      <td
                        key={column.id}
                        className={`px-6 py-[18px] align-middle text-[15px] font-medium text-[#333333] ${
                          columnIndex === 0 ? "rounded-l-[20px]" : ""
                        }`}
                      >
                        {renderCellValue(objeto, column)}
                      </td>
                    ))}

                    {hasActions && (
                      <td className="rounded-r-[20px] px-6 py-[18px] align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {resolvedActions.includes("view") && (
                            <button
                              type="button"
                              onClick={() => openModal("view", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">visibility</span>
                            </button>
                          )}

                          {resolvedActions.includes("edit") && (
                            <button
                              type="button"
                              onClick={() => openModal("edit", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">edit</span>
                            </button>
                          )}

                          {resolvedActions.includes("delete") && (
                            <button
                              type="button"
                              onClick={() => openModal("delete", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#F2E2E2] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="block md:hidden">
        <div className="space-y-4 p-4">
          {data.length === 0 ? (
            <div className="rounded-[18px] border border-[#DDEEEF] px-4 py-6 text-center text-[#6B7280]">
              Nenhum dado encontrado.
            </div>
          ) : (
            data.map((objeto, index) => {
              const statusColumn = columns.find((column) => isStatusColumn(column.id));

              return (
                <div
                  key={index}
                  className="rounded-[20px] border border-[#DDEEEF] bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>{columns[0] && renderCellValue(objeto, columns[0])}</div>
                    <div>{statusColumn && renderCellValue(objeto, statusColumn)}</div>
                  </div>

                  <div className="space-y-2">
                    {columns
                      .slice(1)
                      .filter((column) => !isStatusColumn(column.id))
                      .map((column) => (
                        <div key={column.id} className="flex flex-col">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]">
                            {column.label}
                          </span>
                          <span className="text-[15px] font-medium text-[#1F1F1F]">
                            {renderCellValue(objeto, column)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {hasActions && (
                    <div className="mt-4 flex items-center justify-end gap-2">
                      {resolvedActions.includes("view") && (
                        <button
                          type="button"
                          onClick={() => openModal("view", objeto)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA]"
                        >
                          <span className="material-symbols-outlined !text-[22px]">visibility</span>
                        </button>
                      )}

                      {resolvedActions.includes("edit") && (
                        <button
                          type="button"
                          onClick={() => openModal("edit", objeto)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#E3ECEE] bg-white text-[#0B6470] transition hover:bg-[#F5FAFA]"
                        >
                          <span className="material-symbols-outlined !text-[22px]">edit</span>
                        </button>
                      )}

                      {resolvedActions.includes("delete") && (
                        <button
                          type="button"
                          onClick={() => openModal("delete", objeto)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#F2E2E2] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7]"
                        >
                          <span className="material-symbols-outlined !text-[22px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {renderPagination()}

      {modalAction && selectedContent && (
        <Modal setValue={closeModal} value={modalAction != null}>
          <Form
            object={selectedContent}
            name={nomePagina}
            camps={data.length > 0 ? Object.keys(data[0]) : []}
            type={modalAction}
            fields={formFields}
            validationSchema={formValidationSchema}
            hiddenFields={formHiddenFields}
            onCancel={closeModal}
            onConfirm={async (formData) => {
              try {
                if (modalAction === "delete") {
                  const confirmDelete = window.confirm(
                    `Tem certeza que deseja excluir este ${nomePagina}?`
                  );
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
              } catch (error) {
                console.error("Erro na operacao:", error);
                alert("Erro na operacao. Tente novamente.");
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Table;
