import React, { useEffect, useState } from "react";

type SearchFilters = {
  nome: string;
  cpf: string;
  telefone: string;
};

type SearchBarProps = {
  onSearch: (filters: SearchFilters) => void;
};

const initialFilters: SearchFilters = {
  nome: "",
  cpf: "",
  telefone: "",
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onSearch(initialFilters);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onSearch(initialFilters);
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#393939] rounded-2xl p-5 shadow-lg w-full flex flex-col gap-4"
      role="search"
      aria-label="Buscar fornecedores"
    >
      <div>
        <p className="text-white text-base font-semibold" id="search-forne-heading">
          Busca:
        </p>
        <p className="text-sm text-gray-400 -mt-1">Aqui voce busca e filtra</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <div className="flex-1 max-w-md md:w-auto">
          <label htmlFor="search-forne-nome" className="sr-only">
            Nome
          </label>
          <input
            id="search-forne-nome"
            type="text"
            placeholder="Nome"
            value={filters.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-full outline-none bg-white text-black placeholder-gray-500"
            aria-label="Buscar por nome"
          />
        </div>

        <div className="flex-1 max-w-sm md:w-auto">
          <label htmlFor="search-forne-cpf" className="sr-only">
            CPF
          </label>
          <input
            id="search-forne-cpf"
            type="text"
            placeholder="CPF"
            value={filters.cpf}
            onChange={(e) => handleChange("cpf", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-full outline-none bg-white text-black placeholder-gray-500"
            aria-label="Buscar por CPF"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          <button
            className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            type="submit"
            aria-label="Executar busca de fornecedores"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              search
            </span>
            Buscar
          </button>

          <button
            onClick={() => alert("Levar para a tela de cadastro")}
            className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            type="button"
            aria-label="Cadastrar novo fornecedor"
          >
            <span className="material-symbols-outlined text-white text-base" aria-hidden="true">
              add
            </span>
            Cadastrar
          </button>

          <button
            onClick={toggleAdvanced}
            className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            type="button"
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters-forne"
            aria-label={showAdvanced ? "Ocultar filtros avancados" : "Mostrar filtros avancados"}
          >
            <span className="material-symbols-outlined text-white text-base" aria-hidden="true">
              filter_alt
            </span>
            {showAdvanced ? "Ocultar" : "Filtrar"}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div
          id="advanced-filters-forne"
          className="flex flex-col md:flex-row md:items-center gap-3 border-t border-gray-600 pt-4 animate-fadeIn"
          role="group"
          aria-label="Filtros avancados"
        >
          <div className="flex-1 w-full md:w-auto">
            <label htmlFor="search-forne-telefone" className="sr-only">
              Telefone
            </label>
            <input
              id="search-forne-telefone"
              type="text"
              placeholder="Telefone"
              value={filters.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              className="rounded-full px-4 py-2 text-sm w-full outline-none bg-white text-black placeholder-gray-500"
              aria-label="Buscar por telefone"
            />
          </div>

          <button
            onClick={clearFilters}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full transition w-full md:w-auto"
            type="button"
            aria-label="Limpar todos os filtros"
          >
            Limpar
          </button>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
