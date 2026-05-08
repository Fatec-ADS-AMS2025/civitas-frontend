import React, { useEffect, useState } from "react";

type SearchBarProps = {
  onSearch: (filters: {
    nome: string;
    cpf: string;
    telefone: string;
  }) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    nome: "",
    cpf: "",
    telefone: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const form = e.currentTarget.form ?? e.currentTarget.closest("form, div");
    if (!form) return;

    const selectors =
      "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])";
    const focusables = Array.from(form.querySelectorAll<HTMLElement>(selectors)).filter(
      (element) => element.offsetParent !== null,
    );
    const index = focusables.indexOf(e.currentTarget as HTMLElement);
    const next = focusables[index + 1];
    if (next) next.focus();
  };

  const clearFilters = () => {
    setFilters({
      nome: "",
      cpf: "",
      telefone: "",
    });
  };

  return (
    <div className="civitas-surface flex w-full flex-col gap-4 p-5">
      <div>
        <p className="text-base font-semibold text-[var(--foreground)]">Busca:</p>
        <p className="-mt-1 text-sm text-[var(--foreground-muted)]">
          Aqui voce busca e filtra
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Nome"
          value={filters.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          onKeyDown={handleFieldKeyDown}
          className="civitas-control max-w-md flex-1 px-4 py-2 text-sm md:w-auto"
        />

        <input
          type="text"
          placeholder="CPF"
          value={filters.cpf}
          onChange={(e) => handleChange("cpf", e.target.value)}
          onKeyDown={handleFieldKeyDown}
          className="civitas-control max-w-sm flex-1 px-4 py-2 text-sm md:w-auto"
        />

        <div className="flex w-full flex-col gap-3 sm:flex-row md:ml-auto md:w-auto">
          <button
            type="button"
            onClick={() => alert("Levar para a tela de cadastro")}
            className="civitas-action civitas-action--primary flex w-full items-center justify-center gap-2 px-5 py-2 font-semibold sm:w-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Cadastrar
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="civitas-action civitas-action--secondary flex w-full items-center justify-center gap-2 px-5 py-2 font-semibold sm:w-auto"
          >
            <span className="material-symbols-outlined text-base">filter_alt</span>
            {showAdvanced ? "Ocultar" : "Filtrar"}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="flex w-full flex-col gap-3 border-t border-[var(--divider)] pt-4 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Telefone"
            value={filters.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            onKeyDown={handleFieldKeyDown}
            className="civitas-control w-full flex-1 px-4 py-2 text-sm md:w-auto"
          />

          <button
            type="button"
            onClick={clearFilters}
            className="civitas-action civitas-action--ghost w-full px-5 py-2 font-semibold md:w-auto"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
