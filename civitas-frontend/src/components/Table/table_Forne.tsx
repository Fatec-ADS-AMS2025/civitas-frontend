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

const badgeColor = (situacao: string) => {
  switch (situacao) {
    case "Ativo":
      return "civitas-chip civitas-chip--success";
    case "Inativo":
      return "civitas-chip civitas-chip--danger";
    default:
      return "civitas-chip civitas-chip--slate";
  }
};

const TableForne: React.FC<TableForneProps> = ({ data }) => {
  const [modal, setModal] = useState<{
    action: string;
    fornecedor: Fornecedor | null;
  }>({ action: "", fornecedor: null });

  return (
    <div className="mt-5 w-full overflow-hidden rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] shadow-[var(--shadow-sm)]">
      <div className="max-h-[430px] overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[var(--foreground)]">
          <thead className="sticky top-0 z-10 bg-[var(--secundary-1)] text-[var(--text-on-brand)]">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nome Fantasia</th>
              <th className="p-3">CNPJ</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Situacao</th>
              <th className="p-3">Acoes</th>
            </tr>
          </thead>

          <tbody>
            {data.map((fornecedor) => (
              <tr
                key={fornecedor.id}
                className="border-b border-[var(--divider)] transition-colors hover:bg-[var(--surface-subtle)]"
              >
                <td className="p-3">{fornecedor.id}</td>
                <td className="p-3">{fornecedor.nomeFantasia}</td>
                <td className="p-3">{fornecedor.cnpj}</td>
                <td className="p-3">{fornecedor.telefone}</td>
                <td className="p-3">
                  <span className={badgeColor(fornecedor.situacao)}>
                    {fornecedor.situacao}
                  </span>
                </td>

                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setModal({ action: "Ver", fornecedor })}
                    className="civitas-action civitas-action--ghost inline-flex h-9 w-9 items-center justify-center p-0"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ action: "Editar", fornecedor })}
                    className="civitas-action civitas-action--ghost inline-flex h-9 w-9 items-center justify-center p-0"
                  >
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ action: "Excluir", fornecedor })}
                    className="civitas-action civitas-action--danger inline-flex h-9 w-9 items-center justify-center p-0"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.fornecedor && (
        <div className="civitas-overlay fixed inset-0 flex items-center justify-center px-4">
          <div className="civitas-surface relative w-full max-w-sm p-6 text-center">
            <button
              type="button"
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="civitas-action civitas-action--ghost absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center p-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="mb-3 text-xl font-bold text-[var(--foreground)]">
              {modal.action} Fornecedor
            </h2>

            <p className="text-[var(--foreground-muted)]">
              {modal.fornecedor.nomeFantasia}
            </p>

            <button
              type="button"
              onClick={() => setModal({ action: "", fornecedor: null })}
              className="civitas-action civitas-action--primary mt-4 px-5 py-2"
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
