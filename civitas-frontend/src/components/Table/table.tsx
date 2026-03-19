import React, { useState } from "react";
import Form from "../Form/form";
import Modal from "../modal";
import type { FieldConfig as ModalFieldConfig, FormMode, ValidationFn } from "../Form/form";
import { usePathname } from "next/navigation";

type Column = {
  id: string;
  label: string;
};

type TableProps = {
  data: any[];
  columns: Column[];
  actions?: string[];
  onEdit?: (id: number, data: any) => Promise<any>;
  onDelete?: (id: number) => Promise<void>;
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
};

const Table = ({
  data,
  columns,
  onEdit,
  onDelete,
  actions = ["edit", "view"],
  formFields,
  formValidationSchema,
  formHiddenFields,
}: TableProps) => {
  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];

  const getIdField = (obj: any): string => {
    if (obj.id !== undefined) return "id";
    if (obj.idSecretaria !== undefined) return "idSecretaria";
    if (obj.idFornecedor !== undefined) return "idFornecedor";
    if (obj.idOrcamento !== undefined) return "idOrcamento";
    return "id";
  };

  const [modalAction, setModalAction] = useState<FormMode | null>(null);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);

  const openModal = (action: FormMode, objeto: any) => {
    setSelectedContent(objeto);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedContent(null);
  };

  const getStatusValue = (objeto: any) => {
    return (
      objeto.status ??
      objeto.situacao ??
      objeto.ativo ??
      objeto.estado ??
      null
    );
  };

  const renderStatusBadge = (status: any) => {
    if (status === null || status === undefined) return null;

    const normalized = String(status).toLowerCase();

    let classes =
      "inline-flex min-w-[64px] justify-center rounded-full px-3 py-[6px] text-[11px] font-bold leading-none";

    if (normalized === "ativo" || normalized === "true" || normalized === "sim") {
      classes += " bg-[#F7A600] text-white";
    } else if (
      normalized === "inativo" ||
      normalized === "false" ||
      normalized === "não" ||
      normalized === "nao"
    ) {
      classes += " bg-[#FF8A8A] text-white";
    } else {
      classes += " bg-gray-300 text-black";
    }

    return <span className={classes}>{String(status)}</span>;
  };

  const renderCellValue = (objeto: any, column: Column) => {
    const value = objeto[column.id];

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

  return (
    <div className="mt-5 w-full rounded-[30px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)] ring-1 ring-[#E5F1F2] overflow-hidden">
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto px-5 py-5 lg:px-6">
          <table className="w-full border-separate border-spacing-y-[16px] text-left text-black">
            <thead>
              <tr className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#C8C8C8]">
                {columns.map((column) => (
                  <th key={column.id} className="px-6 py-2">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-2 text-center">Status</th>
                <th className="px-6 py-2 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="rounded-[18px] border border-[#DDEEEF] px-4 py-6 text-center text-[#6B7280]"
                  >
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                data.map((objeto, i) => {
                  const status = getStatusValue(objeto);

                  return (
                    <tr
                      key={i}
                      className="overflow-hidden rounded-[20px] bg-white shadow-none ring-1 ring-[#D9EFF1]"
                    >
                      {columns.map((column, index) => (
                        <td
                          key={column.id}
                          className={`px-6 py-[18px] align-middle text-[15px] font-medium text-[#333333] ${
                            index === 0 ? "rounded-l-[20px]" : ""
                          }`}
                        >
                          {renderCellValue(objeto, column)}
                        </td>
                      ))}

                      <td className="px-6 py-[18px] text-center align-middle">
                        {renderStatusBadge(status)}
                      </td>

                      <td className="rounded-r-[20px] px-6 py-[18px] align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {actions?.includes("view") && (
                            <button
                              type="button"
                              onClick={() => openModal("view", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#0B6470] transition hover:bg-[#F8FBFB]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">
                                visibility
                              </span>
                            </button>
                          )}

                          {actions?.includes("edit") && (
                            <button
                              type="button"
                              onClick={() => openModal("edit", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#0B6470] transition hover:bg-[#F8FBFB]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">
                                edit
                              </span>
                            </button>
                          )}

                          {actions?.includes("delete") && (
                            <button
                              type="button"
                              onClick={() => openModal("delete", objeto)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7]"
                            >
                              <span className="material-symbols-outlined !text-[22px]">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            data.map((objeto, i) => {
              const status = getStatusValue(objeto);

              return (
                <div
                  key={i}
                  className="rounded-[20px] border border-[#DDEEEF] bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>{columns[0] && renderCellValue(objeto, columns[0])}</div>
                    <div>{renderStatusBadge(status)}</div>
                  </div>

                  <div className="space-y-2">
                    {columns.slice(1).map((column) => (
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

                  <div className="mt-4 flex items-center justify-end gap-2">
                    {actions?.includes("view") && (
                      <button
                        type="button"
                        onClick={() => openModal("view", objeto)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#0B6470] transition hover:bg-[#F8FBFB]"
                      >
                        <span className="material-symbols-outlined !text-[22px]">
                          visibility
                        </span>
                      </button>
                    )}

                    {actions?.includes("edit") && (
                      <button
                        type="button"
                        onClick={() => openModal("edit", objeto)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#0B6470] transition hover:bg-[#F8FBFB]"
                      >
                        <span className="material-symbols-outlined !text-[22px]">
                          edit
                        </span>
                      </button>
                    )}

                    {actions?.includes("delete") && (
                      <button
                        type="button"
                        onClick={() => openModal("delete", objeto)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#EEF3F4] bg-white text-[#FF8A8A] transition hover:bg-[#FFF7F7]"
                      >
                        <span className="material-symbols-outlined !text-[22px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
                    const idField = getIdField(selectedContent);
                    const id = selectedContent[idField];
                    await onDelete(id);
                  }
                } else if (modalAction === "edit" && onEdit) {
                  const idField = getIdField(selectedContent);
                  const id = selectedContent[idField];
                  await onEdit(id, formData);
                }

                closeModal();
              } catch (error) {
                console.error("Erro na operação:", error);
                alert("Erro na operação. Tente novamente.");
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Table;