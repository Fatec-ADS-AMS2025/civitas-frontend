import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Form from "../Form/form";
import Modal from "../modal";

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
  dados: any[];
  setDados: React.Dispatch<React.SetStateAction<any[]>>;
  onCadastrar?: (data: any) => Promise<any>;
  showCadastrarButton?: boolean;
  model: object | string[];
};

const SearchBar = ({
  campos,
  setCampos,
  dados,
  setDados,
  model,
  onCadastrar,
  showCadastrarButton = true,
}: SearchBarProps) => {
  const [modalOpen, setModalOpen] = useState<boolean | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];

  const principalFields = campos.filter((field) => field.local === "principal");
  const advancedFields = campos.filter((field) => field.local === "filtro");

  const normalizeText = (text: string): string =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const applyFilters = (fields: FieldConfig[]) => {
    let filteredData = [...dados];

    fields.forEach((field) => {
      const filterValue = normalizeText(field.value?.toString() || "");
      if (!filterValue) return;

      filteredData = filteredData.filter((item: any) => {
        const itemFieldValue = normalizeText(item[field.key]?.toString() || "");
        return itemFieldValue.includes(filterValue);
      });
    });

    setDados(filteredData);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyFilters(campos);
  };

  const handleChange = (key: string, value: string) => {
    setCampos((previousFields) =>
      previousFields.map((field) =>
        field.key === key ? { ...field, value } : field
      )
    );
  };

  const clearFilters = () => {
    const clearedFields = campos.map((field) => ({ ...field, value: "" }));
    setCampos(clearedFields);
    setDados(dados);
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  useEffect(() => {
    const hasActiveFilters = campos.some(
      (field) => normalizeText(field.value?.toString() || "") !== ""
    );

    if (!hasActiveFilters) {
      setDados(dados);
      return;
    }

    applyFilters(campos);
  }, [dados]);

  const renderField = (field: FieldConfig) => {
    const fieldValue = campos.find((item) => item.key === field.key)?.value || "";

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="flex-1 w-full md:w-auto">
          <label htmlFor={`search-${field.key}`} className="sr-only">
            {field.placeholder}
          </label>
          <select
            id={`search-${field.key}`}
            value={fieldValue}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-full outline-none bg-white text-black"
            aria-label={field.placeholder}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex-1 w-full md:w-auto">
        <label htmlFor={`search-${field.key}`} className="sr-only">
          {field.placeholder}
        </label>
        <input
          id={`search-${field.key}`}
          type="text"
          value={fieldValue}
          placeholder={field.placeholder}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className="rounded-full px-4 py-2 text-sm w-full outline-none bg-white text-black placeholder-gray-500"
          aria-label={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="bg-[#393939] rounded-xl p-5 shadow-lg w-full flex flex-col gap-4 skeleton">
      <div>
        <p className="text-white text-base font-semibold" id="search-heading">
          Busca:
        </p>
        <p className="text-sm text-gray-400 -mt-1">Aqui voce busca e filtra</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        role="search"
        aria-label="Buscar e filtrar registros"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          {principalFields.map((field) => renderField(field))}

          <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
            <button
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
              type="submit"
              aria-label="Executar busca"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                search
              </span>
              Buscar
            </button>

            {showCadastrarButton && (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
                type="button"
                aria-label="Cadastrar novo registro"
              >
                <span className="material-symbols-outlined text-white text-base" aria-hidden="true">
                  add
                </span>
                Cadastrar
              </button>
            )}

            {advancedFields.length > 0 && (
              <button
                onClick={toggleAdvanced}
                className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
                type="button"
                aria-expanded={showAdvanced}
                aria-controls="advanced-filters"
                aria-label={showAdvanced ? "Ocultar filtros avancados" : "Mostrar filtros avancados"}
              >
                <span className="material-symbols-outlined text-white text-base" aria-hidden="true">
                  filter_alt
                </span>
                {showAdvanced ? "Ocultar" : "Filtrar"}
              </button>
            )}
          </div>
        </div>

        {showAdvanced && advancedFields.length > 0 && (
          <div
            id="advanced-filters"
            className="flex flex-col md:flex-row md:items-center gap-3 border-t border-gray-600 pt-4 animate-fadeIn"
            role="group"
            aria-label="Filtros avancados"
          >
            {advancedFields.map((field) => renderField(field))}
            <button
              onClick={clearFilters}
              className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full transition w-full md:w-auto"
              type="button"
              aria-label="Limpar todos os filtros"
            >
              Limpar
            </button>
          </div>
        )}
      </form>

      {modalOpen && (
        <Modal setValue={() => setModalOpen(false)} value={modalOpen}>
          <Form
            object={model}
            name={nomePagina}
            type="create"
            onCancel={() => setModalOpen(false)}
            onConfirm={async (data) => {
              try {
                if (onCadastrar) {
                  await onCadastrar(data);
                }
                setModalOpen(false);
              } catch (error) {
                console.error("Erro ao cadastrar:", error);
                alert("Erro ao cadastrar. Tente novamente.");
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export { SearchBar, type FieldConfig };
