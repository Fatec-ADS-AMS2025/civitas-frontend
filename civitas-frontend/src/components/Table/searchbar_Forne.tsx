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
  }, [filters]);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form ?? e.currentTarget.closest('form, div');
      if (!form) return;
      const selectors = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])';
      const focusables = Array.from(form.querySelectorAll<HTMLElement>(selectors)).filter((el) => el.offsetParent !== null);
      const index = focusables.indexOf(e.currentTarget as HTMLElement);
      const next = focusables[index + 1];
      if (next) {
        next.focus();
      }
    }
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    setFilters({
      nome: "",
      cpf: "",
      telefone: "",
    });
  };

  return (
    <div className="civitas-surface flex w-full flex-col gap-4 p-5">
      {/* Cabeçalho */}
      <div>
        <p className="text-base font-semibold text-[var(--foreground)]">Busca:</p>
        <p className="-mt-1 text-sm text-[var(--foreground-muted)]">Aqui você busca e filtra</p>
      </div>

      {/* Linha principal */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <input
          type="text"
          placeholder="Nome"
          value={filters.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          onKeyDown={handleFieldKeyDown}
          className="civitas-control max-w-md flex-1 px-4 py-2 text-sm outline-none md:w-auto"
        />

        <input
          type="text"
          placeholder="CPF"
          value={filters.cpf}
          onChange={(e) => handleChange("cpf", e.target.value)}
          onKeyDown={handleFieldKeyDown}
          className="civitas-control max-w-sm flex-1 px-4 py-2 text-sm outline-none md:w-auto"
        />

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          <button
            onClick={() => alert("Levar para a tela de cadastro")}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--primary-1)] bg-[var(--primary-1)] px-5 py-2 font-semibold text-white transition hover:brightness-95 sm:w-auto"
          >
            <span className="material-symbols-outlined text-white text-base">add</span>
            Cadastrar
          </button>

          <button
            onClick={toggleAdvanced}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
          >
            <span className="material-symbols-outlined text-white text-base">filter_alt</span>
            {showAdvanced ? "Ocultar" : "Filtrar"}
          </button>
        </div>
      </div>

      {/* Filtro avançado */}
      {showAdvanced && (
        <div className="animate-fadeIn flex flex-col gap-3 border-t border-[var(--border-soft)] pt-4 md:flex-row md:items-center">
          {/* Apenas telefone */}
          <input
            type="text"
            placeholder="Telefone"
            value={filters.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            onKeyDown={handleFieldKeyDown}
            className="civitas-control w-full flex-1 px-4 py-2 text-sm outline-none md:w-auto"
          />

          {/* Botão limpar verde */}
          <button
            onClick={clearFilters}
            className="w-full rounded-sm border border-[var(--border-accent-teal)] bg-[var(--surface-accent-teal)] px-5 py-2 font-semibold text-[var(--text-accent-teal)] transition hover:brightness-95 md:w-auto"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
