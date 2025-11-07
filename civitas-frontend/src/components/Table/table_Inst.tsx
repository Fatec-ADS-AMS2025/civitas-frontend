import React, { useState } from "react";

type Instituicao = {
  id: number;
  nome: string;
  razao: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  num: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  situacao: "Ativa" | "Inativa";
};

type TableProps = {
  data: Instituicao[];
};

const Table: React.FC<TableProps> = ({ data }) => {
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Instituicao | null>(null);

  const getBadgeColor = (situacao: string) => {
    switch (situacao) {
      case "Ativa":
        return "bg-[#2ECC71] text-white"; 
      case "Inativa":
        return "bg-[#E74C3C] text-white"; 
      default:
        return "bg-gray-300 text-black";
    }
  };

  const openModal = (action: string, inst: Instituicao) => {
    setSelectedUser(inst);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedUser(null);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mt-5">

      {/* Tabela Desktop */}
      <div className="hidden md:block">
        <div className="max-h-[400px] overflow-y-auto relative">
          <table className="w-full text-left border-collapse text-black">
            <thead className="bg-primary-1 text-black sticky top-0 z-10">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Razão Social</th>
                <th className="p-3">CNPJ</th>
                <th className="p-3">CEP</th>
                <th className="p-3">Logradouro</th>
                <th className="p-3">Número</th>
                <th className="p-3">Bairro</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {data.map((inst) => (
                <tr
                  key={inst.id}
                  className="border-b last:border-none hover:bg-gray-100 transition"
                >
                  <td className="p-3 text-black">{inst.id}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${getBadgeColor(
                        inst.situacao
                      )}`}
                    >
                      {inst.situacao}
                    </span>
                  </td>

                  <td className="p-3 text-black">{inst.nome}</td>
                  <td className="p-3 text-black">{inst.razao}</td>
                  <td className="p-3 text-black">{inst.cnpj}</td>
                  <td className="p-3 text-black">{inst.cep}</td>
                  <td className="p-3 text-black">{inst.logradouro}</td>
                  <td className="p-3 text-black">{inst.num}</td>
                  <td className="p-3 text-black">{inst.bairro}</td>
                  <td className="p-3 text-black">{inst.cidade}</td>
                  <td className="p-3 text-black">{inst.estado}</td>
                  <td className="p-3 text-black">{inst.telefone}</td>
                  <td className="p-3 text-black">{inst.email}</td>

                  <td className="p-3 flex gap-2">
                    <button
                      title="Ver"
                      onClick={() => openModal("Ver", inst)}
                      className="hover:scale-110 transition"
                    >
                      <span className="material-symbols-outlined text-black">
                        visibility
                      </span>
                    </button>

                    <button
                      title="Editar"
                      onClick={() => openModal("Editar", inst)}
                      className="hover:scale-110 transition"
                    >
                      <span className="material-symbols-outlined text-black">
                        edit_square
                      </span>
                    </button>

                    <button
                      title="Excluir"
                      onClick={() => openModal("Excluir", inst)}
                      className="hover:scale-110 transition"
                    >
                      <span className="material-symbols-outlined text-black">
                        delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden flex flex-col divide-y">
        {data.map((user) => (
          <div key={user.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-secondary-1">
                {user.nome}
              </h3>
              
              <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${getBadgeColor(
                  user.situacao
                )}`}
              >
                {user.situacao}
              </span>
            </div>

            <p className="text-sm text-gray-600">CNPJ: {user.cnpj}</p>
            <p className="text-sm text-gray-600">Razão Social: {user.razao}</p>
            <p className="text-sm text-gray-600">Telefone: {user.telefone}</p>
            <p className="text-sm text-gray-600">
              {user.logradouro}, {user.num} - {user.bairro}
            </p>
            <p className="text-sm text-gray-600">
              {user.cidade} - {user.estado}
            </p>
            <p className="text-sm text-gray-600">CEP: {user.cep}</p>
            <p className="text-sm text-gray-600">Email: {user.email}</p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => openModal("Ver", user)}
                className="hover:scale-110 transition"
              >
                <span className="material-symbols-outlined text-black">
                  visibility
                </span>
              </button>
              <button
                onClick={() => openModal("Editar", user)}
                className="hover:scale-110 transition"
              >
                <span className="material-symbols-outlined text-black">
                  edit_square
                </span>
              </button>
              <button
                onClick={() => openModal("Excluir", user)}
                className="hover:scale-110 transition"
              >
                <span className="material-symbols-outlined text-black">
                  delete
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalAction && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 md:w-96 text-center relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-secondary-1 mb-2">
              {modalAction} Usuário
            </h2>

            <p className="text-gray-600 mb-5">{selectedUser.nome}</p>

            <button
              onClick={closeModal}
              className="bg-primary-1 hover:bg-secondary-1/80 text-white px-5 py-2 rounded-full font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
