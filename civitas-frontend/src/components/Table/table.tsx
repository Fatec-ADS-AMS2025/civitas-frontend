import React, { useState } from "react";

type User = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  tipo: "Administrador" | "Cidadão" | "Funcionário";
};

type TableProps = {
  data: User[];
};

const Table: React.FC<TableProps> = ({ data }) => {
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Administrador":
        return "bg-[#51A5D6] text-black";
      case "Cidadão":
        return "bg-[#FFCB73] text-black";
      case "Funcionário":
        return "bg-[#B1D4A3] text-black";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const openModal = (action: string, user: User) => {
    setSelectedUser(user);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedUser(null);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mt-5">
      {/* Tabela - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-black">
          <thead>
            <tr className="bg-primary-1 text-black">
              <th className="p-3">ID</th>
              <th className="p-3">Nome</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Matrícula</th>
              <th className="p-3">Cidade</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-none hover:bg-gray-100 transition"
              >
                <td className="p-3 text-black">{user.id}</td>
                <td className="p-3 text-black">{user.nome}</td>
                <td className="p-3 text-black">{user.cpf}</td>
                <td className="p-3 text-black">{user.matricula}</td>
                <td className="p-3 text-black">{user.cidade}</td>
                <td className="p-3 text-black">{user.estado}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm  ${getBadgeColor(
                      user.tipo
                    )}`}
                  >
                    {user.tipo}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    title="Ver"
                    onClick={() => openModal("Ver", user)}
                    className="hover:scale-110 transition"
                  >
                    <span className="material-symbols-outlined text-black">
                      visibility
                    </span>
                  </button>

                  <button
                    title="Editar"
                    onClick={() => openModal("Editar", user)}
                    className="hover:scale-110 transition"
                  >
                    <span className="material-symbols-outlined text-black">
                      edit_square
                    </span>
                  </button>

                  <button
                    title="Excluir"
                    onClick={() => openModal("Excluir", user)}
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

      {/* Cards - Mobile */}
      <div className="md:hidden flex flex-col divide-y">
        {data.map((user) => (
          <div key={user.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-secondary-1">
                {user.nome}
              </h3>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${getBadgeColor(
                  user.tipo
                )}`}
              >
                {user.tipo}
              </span>
            </div>
            <p className="text-sm text-gray-600">CPF: {user.cpf}</p>
            <p className="text-sm text-gray-600">Matrícula: {user.matricula}</p>
            <p className="text-sm text-gray-600">
              {user.cidade} - {user.estado}
            </p>

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
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 md:w-96 text-center relative transform transition-all duration-300 scale-100 animate-slideUp">
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
