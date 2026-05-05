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
        return "civitas-badge civitas-badge--status-active"; 
      case "Inativo":
        return "civitas-badge civitas-badge--status-inactive"; 
      default:
        return "civitas-badge civitas-badge--status-neutral";
    }
  };

  return (
    <div className="civitas-table-shell mt-5 w-full overflow-hidden">

      <div className="max-h-[430px] overflow-y-auto">
        <table className="w-full text-left border-collapse">

          <thead className="sticky top-0 z-10 bg-[var(--primary-1)] text-white">
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
              <tr key={f.id} className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-subtle)]">
                <td className="p-3">{f.id}</td>
                <td className="p-3">{f.nomeFantasia}</td>
                <td className="p-3">{f.cnpj}</td>
                <td className="p-3">{f.telefone}</td>
                <td className="p-3">
                  <span className={`${badgeColor(f.situacao)} px-3 py-1 text-sm`}>
                    {f.situacao}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => setModal({ action: "Ver", fornecedor: f })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button
                    onClick={() => setModal({ action: "Editar", fornecedor: f })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                  >
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>
                  <button
                    onClick={() => setModal({ action: "Excluir", fornecedor: f })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-danger)] bg-[var(--surface-elevated)] text-[var(--action-danger-bg)] transition hover:bg-[var(--surface-danger-soft)]"
                  >
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
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--modal-overlay)]">
          <div className="relative w-80 rounded-sm bg-[var(--surface-elevated)] p-6 text-center shadow-[var(--shadow-lg)]">
            <button
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="mb-3 text-xl font-bold text-[var(--foreground)]">{modal.action} Fornecedor</h2>

            <p className="text-[var(--foreground-muted)]">{modal.fornecedor.nomeFantasia}</p>

            <button
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="mt-4 rounded-sm border border-[var(--primary-1)] bg-[var(--primary-1)] px-5 py-2 text-white"
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
