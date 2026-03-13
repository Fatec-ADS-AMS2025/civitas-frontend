import React, { useState } from "react";

type Fornecedor = {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  situacao: "Ativo" | "Inativo";
};

type TableForneProps = {
  data: Fornecedor[];
};

const TableForne: React.FC<TableForneProps> = ({ data }) => {
  const [modal, setModal] = useState<{
    action: string;
    fornecedor: Fornecedor | null;
  }>({ action: "", fornecedor: null });

  const badgeColor = (situacao: string) => {
       switch (situacao) {
      case "Ativo":
        return "bg-[#2ECC71] text-white"; 
      case "Inativo":
        return "bg-[#E74C3C] text-white"; 
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mt-5">

      <div className="max-h-[430px] overflow-y-auto">
        <table className="w-full text-left border-collapse">

          <thead className="bg-[#4BA3A4] text-white sticky top-0 z-10">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nome Fantasia</th>
              <th className="p-3">CNPJ</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Situação</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{f.id}</td>
                <td className="p-3">{f.nomeFantasia}</td>
                <td className="p-3">{f.cnpj}</td>
                <td className="p-3">{f.telefone}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${badgeColor(f.situacao)}`}>
                    {f.situacao}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button onClick={() => setModal({ action: "Ver", fornecedor: f })}>
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button onClick={() => setModal({ action: "Editar", fornecedor: f })}>
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>
                  <button onClick={() => setModal({ action: "Excluir", fornecedor: f })}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {modal.fornecedor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center relative">
            <button
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="absolute top-3 right-3"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-xl font-bold mb-3">{modal.action} Fornecedor</h2>

            <p className="text-gray-600">{modal.fornecedor.nomeFantasia}</p>

            <button
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="mt-4 px-5 py-2 rounded-full bg-[#4BA3A4] text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableForne;
