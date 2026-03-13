import React, { useEffect, useMemo, useState } from "react";
import Modal from "../modal";
import Form from "../Form/form";
import { usePathname } from "next/navigation";
import {
  applySearchFilters,
  buildInitialAdvancedFilters,
  type SearchFieldConfig,
} from "./search-utils";

type FieldConfig = SearchFieldConfig;

type SearchBarProps = {
  campos: FieldConfig[];
  setCampos: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
  camposFiltro?: FieldConfig[];
  dados: any[];
  setDados: React.Dispatch<React.SetStateAction<any>>;
  onCadastrar?: (data: any) => Promise<any>;
  showCadastrarButton?: boolean;
  model: object | string[];
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
};

const SearchBar = ({
  campos,
  setCampos,
  dados,
  setDados,
  model,
  onCadastrar,
  showCadastrarButton = true,
  formFields,
  formValidationSchema,
  formHiddenFields,
}: SearchBarProps) => {
  const [modalOpen, setModalOpen] = useState<boolean | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>(() =>
    buildInitialAdvancedFilters(campos)
  );

  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);
  const nomePagina = paths[paths.length - 1];

  const principalFields = useMemo(
    () => campos.filter((field) => field.local === "principal"),
    [campos]
  );

  const hasAnyField = campos.length > 0;
  const globalPlaceholder =
    principalFields.length > 0
      ? `Buscar em ${principalFields.map((field) => field.placeholder).join(", ")}`
      : "Busca global";

  useEffect(() => {
    setAdvancedFilters((prev) => {
      const next: Record<string, string> = {};
      campos.forEach((campo) => {
        next[campo.key] = prev[campo.key] ?? campo.value ?? "";
      });
      return next;
    });
  }, [campos]);

  useEffect(() => {
    const filteredData = applySearchFilters(dados, campos, globalQuery, advancedFilters);
    setDados(filteredData);
  }, [dados, campos, globalQuery, advancedFilters, setDados]);

  const handleAdvancedChange = (key: string, value: string) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }));

    setCampos((prevCampos) =>
      prevCampos.map((campo) => (campo.key === key ? { ...campo, value } : campo))
    );
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    setGlobalQuery("");

    const clearedAdvanced = Object.keys(advancedFilters).reduce<Record<string, string>>(
      (acc, key) => {
        acc[key] = "";
        return acc;
      },
      {}
    );

    setAdvancedFilters(clearedAdvanced);
    setCampos((prevCampos) => prevCampos.map((campo) => ({ ...campo, value: "" })));
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = advancedFilters[field.key] || "";

    if (field.type === "select" && field.options) {
      return (
        <select
          key={field.key}
          value={fieldValue}
          onChange={(e) => handleAdvancedChange(field.key, e.target.value)}
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
        value={fieldValue}
        placeholder={field.placeholder}
        onChange={(e) => handleAdvancedChange(field.key, e.target.value)}
        className="rounded-full px-4 py-2 text-sm w-full md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
      />
    );
  };

  return (
    <div className="bg-[#393939] rounded-xl p-5 shadow-lg w-full flex flex-col gap-4 skeleton">
      <div>
        <p className="text-white text-base">Busca:</p>
        <p className="text-sm text-gray-400 -mt-1">Busca global + filtros avancados</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <input
          type="text"
          value={globalQuery}
          placeholder={globalPlaceholder}
          onChange={(e) => setGlobalQuery(e.target.value)}
          className="rounded-full px-4 py-2 text-sm w-full md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
        />

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          {showCadastrarButton && (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">add</span>
              Cadastrar
            </button>
          )}

          {hasAnyField && (
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

      {showAdvanced && hasAnyField && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-gray-600 pt-4 animate-fadeIn">
          {campos.map((field) => renderField(field))}
          <button
            onClick={clearFilters}
            className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full transition w-full md:w-auto"
          >
            Limpar
          </button>
        </div>
      )}

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
