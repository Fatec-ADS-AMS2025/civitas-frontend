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

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    setFilters({
      nome: "",
      cpf: "",
      telefone: "",
    });
  };

  return (
    <div className="bg-[#393939] rounded-2xl p-5 shadow-lg w-full flex flex-col gap-4">
      {/* Cabeçalho */}
      <div>
        <p className="text-white text-base">Busca:</p>
        <p className="text-sm text-gray-400 -mt-1">Aqui você busca e filtra</p>
      </div>

      {/* Linha principal */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <input
          type="text"
          placeholder="Nome"
          value={filters.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          className="rounded-full px-4 py-2 text-sm max-w-md md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
        />

        <input
          type="text"
          placeholder="CPF"
          value={filters.cpf}
          onChange={(e) => handleChange("cpf", e.target.value)}
          className="rounded-full px-4 py-2 text-sm max-w-sm md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
        />

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          <button
            onClick={() => alert("Levar para a tela de cadastro")}
            className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-white text-base">add</span>
            Cadastrar
          </button>

          <button
            onClick={toggleAdvanced}
            className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-white text-base">filter_alt</span>
            {showAdvanced ? "Ocultar" : "Filtrar"}
          </button>
        </div>
      </div>

      {/* Filtro avançado */}
      {showAdvanced && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-gray-600 pt-4 animate-fadeIn">
          {/* Apenas telefone */}
          <input
            type="text"
            placeholder="Telefone"
            value={filters.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-full md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
          />

          {/* Botão limpar verde */}
          <button
            onClick={clearFilters}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full transition w-full md:w-auto"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
