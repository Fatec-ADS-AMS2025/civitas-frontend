import React, { useState } from "react";

type Column = {
  id: string;
  label: string;
}

type TableProps = {
  data: any[];
  columns: Column[];
};

const Table = ({ data, columns }: TableProps) => {
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
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mt-5">
      {/* Tabela - Desktop */}
      <div className="hidden md:block">

        <div className="relative overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-black">
            <thead className="bg-primary-1 text-black sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} className="p-3">
                    {column.label}
                  </th>
                ))}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Table;
