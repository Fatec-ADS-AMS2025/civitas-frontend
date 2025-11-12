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
};

const Table = ({ data, columns }: TableProps) => {

  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];


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
                      <button onClick={() => openModal("view", objeto)} className="cursor-pointer">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button onClick={() => openModal("edit", objeto)} className="cursor-pointer">
                        <span className="material-symbols-outlined">edit_square</span>
                      </button>
                      <button onClick={() => openModal("delete", objeto)} className="cursor-pointer">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modalAction && (
        <Modal setValue={closeModal} value={modalAction != null}>
          <Form object={selectedContent} name={nomePagina} camps={Object.keys(data[0])} type={modalAction} onCancel={closeModal} onConfirm={() => { }} />
        </Modal>
      )}
    </div>
  );
};

export default Table;
