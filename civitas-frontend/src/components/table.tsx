import React from "react";

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
  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Administrador":
        return "bg-blue-500 text-white";
      case "Cidadão":
        return "bg-yellow-400 text-black";
      case "Funcionário":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-teal-600 text-white">
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
                  className={`px-2 py-1 rounded-lg text-sm font-semibold ${getBadgeColor(
                    user.tipo
                  )}`}
                >
                  {user.tipo}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <button title="Ver">
                  <span className="material-symbols-outlined text-black">
                    visibility
                  </span>
                </button>
                <button title="Editar">
                  <span className="material-symbols-outlined text-black">
                    edit_square
                  </span>
                </button>
                <button title="Excluir">
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
  );
};

export default Table;
