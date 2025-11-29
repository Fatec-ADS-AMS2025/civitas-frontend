import React, { useState } from "react";
import Form from "../Form/form";
import Modal from "../modal";
import { usePathname } from 'next/navigation'

type Column = {
  id: string;
  label: string;
}

type TableProps = {
  data: any[];
  columns: Column[];
  actions?: string[];
  onEdit?: (id: number, data: any) => Promise<any>;
  onDelete?: (id: number) => Promise<void>;
};

const Table = ({ data, columns, onEdit, onDelete, actions = ["edit", "view"] }: TableProps) => {

  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];

  // Função para identificar o campo ID do objeto
  const getIdField = (obj: any): string => {
    if (obj.id !== undefined) return 'id';
    if (obj.idSecretaria !== undefined) return 'idSecretaria';
    if (obj.idFornecedor !== undefined) return 'idFornecedor';
    if (obj.idOrcamento !== undefined) return 'idOrcamento';
    return 'id';
  };

  const [modalAction, setModalAction] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);

  const openModal = (action: string, objeto: any) => {
    setSelectedContent(objeto);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedContent(null);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mt-5 skeleton">
      {/* Tabela - Desktop */}
      <div className="hidden md:block">

        <div className="relative overflow-auto max-h-[500px] skeleton">
          <table className="w-full text-left border-collapse text-black">
            <thead className="bg-primary-1 text-black sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} className="p-3">
                    {column.label}
                  </th>
                ))}
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.length == 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-3 text-center">
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                data.map((objeto, i) => (
                  <tr key={i}>
                    {columns.map((column) => (
                      <td key={column.id} className="p-3 border-t">
                        {objeto[column.id]}
                      </td>
                    ))}
                    <td className="p-3 border-t flex gap-1">
                      {actions?.includes("view") && (
                        <button onClick={() => openModal("view", objeto)} className="cursor-pointer">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      )}
                      {actions?.includes("edit") && (
                        <button onClick={() => openModal("edit", objeto)} className="cursor-pointer">
                          <span className="material-symbols-outlined">edit_square</span>
                        </button>
                      )}
                      {actions?.includes("delete") && (
                        <button onClick={() => openModal("delete", objeto)} className="cursor-pointer">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modalAction && selectedContent && (
        <Modal setValue={closeModal} value={modalAction != null}>
          <Form 
            object={selectedContent} 
            name={nomePagina} 
            camps={data.length > 0 ? Object.keys(data[0]) : []} 
            type={modalAction} 
            onCancel={closeModal} 
            onConfirm={async (formData) => {
              try {
                if (modalAction === 'delete') {
                  // Para delete, apenas confirma a ação
                  const confirmDelete = window.confirm(`Tem certeza que deseja excluir este ${nomePagina}?`);
                  if (!confirmDelete) return;
                  
                  if (onDelete) {
                    const idField = getIdField(selectedContent);
                    const id = selectedContent[idField];
                    await onDelete(id);
                  }
                } else if (modalAction === 'edit' && onEdit) {
                  const idField = getIdField(selectedContent);
                  const id = selectedContent[idField];
                  await onEdit(id, formData);
                }
                closeModal();
              } catch (error) {
                console.error('Erro na operação:', error);
                alert('Erro na operação. Tente novamente.');
              }
            }} 
          />
        </Modal>
      )}
    </div>
  );
};

export default Table;
