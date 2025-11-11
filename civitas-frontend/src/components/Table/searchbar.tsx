import React, { useState } from "react";

type FieldConfig = {
  key: string;
  placeholder: string;
  local: "principal" | "filtro";
  value?: string;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
};

type SearchBarProps = {
  campos: FieldConfig[];
  setCampos: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
  camposFiltro?: FieldConfig[];
  dados: any;
  setDados: React.Dispatch<React.SetStateAction<any>>;
  onCadastrar?: () => void;
  showCadastrarButton?: boolean;
};

const SearchBar = ({
  campos,
  setCampos,
  dados,
  setDados,
  onCadastrar,
  showCadastrarButton = true,
}: SearchBarProps) => {
  const [backupDados] = useState(dados);
  const [backupCampos] = useState(campos);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: string, value: string) => {
    campos = campos.map(c =>
      c.key === key ? { ...c, value } : c
    );
    setCampos(campos);
    let dadosFiltrados = dados;
    campos.forEach(element => {
      const fieldValue = element.value?.toString().toLowerCase() || "";
      if( fieldValue === "") return;
      dadosFiltrados = dadosFiltrados.filter((item: any) => {
        const itemFieldValue = item[element.key]?.toString().toLowerCase() || "";
        return itemFieldValue.includes(fieldValue);
      });      
    });
    setDados(dadosFiltrados);
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    setDados(backupDados);
    setCampos(backupCampos);
  };

  const renderField = (field: FieldConfig) => {
    if (field.type === "select" && field.options) {
      return (
        <select
          key={field.key}
          value={dados[field.key] || ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className="rounded-full px-4 py-2 text-sm w-full md:w-auto flex-1 outline-none bg-white text-black"
        >
          <option value="">{field.placeholder}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        key={field.key}
        type="text"
        value={campos.find(c => c.key === field.key)?.value || ""}
        placeholder={field.placeholder}
        onChange={(e) => handleChange(field.key, e.target.value)}
        className="rounded-full px-4 py-2 text-sm w-full md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
      />
    );
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
        {(campos.filter(e => e.local === "principal")).map((field) => renderField(field))}

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          {showCadastrarButton && (
            <button
              onClick={onCadastrar}
              className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">add</span>
              Cadastrar
            </button>
          )}

          {(campos.filter(e => e.local === "filtro")).length > 0 && (
            <button
              onClick={toggleAdvanced}
              className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">filter_alt</span>
              {showAdvanced ? "Ocultar" : "Filtrar"}
            </button>
          )}
        </div>
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (campos.filter(e => e.local === "filtro")).length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-gray-600 pt-4 animate-fadeIn">
          {campos.filter(e => e.local === "filtro").map((field) => renderField(field))}
          <button
            onClick={clearFilters}
            className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full transition w-full md:w-auto"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};

export { SearchBar, type FieldConfig };
