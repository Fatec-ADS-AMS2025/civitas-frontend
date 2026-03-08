import React, { useState, useEffect, useRef, useCallback } from "react";

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

      <div className="max-h-[430px] overflow-y-auto" tabIndex={0} role="region" aria-label="Tabela de fornecedores">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Lista de fornecedores</caption>

          <thead className="bg-[#4BA3A4] text-white sticky top-0 z-10">
            <tr>
              <th scope="col" className="p-3">ID</th>
              <th scope="col" className="p-3">Nome Fantasia</th>
              <th scope="col" className="p-3">CNPJ</th>
              <th scope="col" className="p-3">Telefone</th>
              <th scope="col" className="p-3">Situação</th>
              <th scope="col" className="p-3">Ações</th>
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
                  <button
                    onClick={() => setModal({ action: "Ver", fornecedor: f })}
                    aria-label={`Ver fornecedor ${f.nomeFantasia}`}
                    title="Ver"
                    type="button"
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                  </button>
                  <button
                    onClick={() => setModal({ action: "Editar", fornecedor: f })}
                    aria-label={`Editar fornecedor ${f.nomeFantasia}`}
                    title="Editar"
                    type="button"
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">edit_square</span>
                  </button>
                  <button
                    onClick={() => setModal({ action: "Excluir", fornecedor: f })}
                    aria-label={`Excluir fornecedor ${f.nomeFantasia}`}
                    title="Excluir"
                    type="button"
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {modal.fornecedor && (
        <TableForneModal
          action={modal.action}
          fornecedor={modal.fornecedor}
          onClose={() => setModal({ action: "", fornecedor: null })}
        />
      )}

    </div>
  );
};

// Componente modal separado com suporte completo a teclado
function TableForneModal({ action, fornecedor, onClose }: { action: string; fornecedor: Fornecedor; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Foco automático ao abrir e restaurar ao fechar
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      const firstBtn = dialogRef.current?.querySelector<HTMLElement>('button');
      firstBtn?.focus();
    });
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Escape fecha o modal
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }

    // Tab trap: mantém foco dentro do modal
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9998]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center relative focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${action} Fornecedor`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          aria-label="Fechar modal"
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        <h2 className="text-xl font-bold mb-3">{action} Fornecedor</h2>
        <p className="text-gray-600">{fornecedor.nomeFantasia}</p>

        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 rounded-full bg-[#4BA3A4] text-white hover:bg-[#3d8e8f]"
          type="button"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default TableForne;
