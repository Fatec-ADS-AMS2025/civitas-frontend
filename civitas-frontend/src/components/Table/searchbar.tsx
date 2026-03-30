"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Form, { type FormFieldConfig, type ValidationFn } from "../Form/form";
import Modal from "../modal";
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
  formFields?: FormFieldConfig[];
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
  const [modalOpen, setModalOpen] = useState(false);
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

  const applyCurrentFilters = (
    query: string = globalQuery,
    filters: Record<string, string> = advancedFilters
  ) => {
    const filteredData = applySearchFilters(dados, campos, query, filters);
    setDados(filteredData);
  };

  useEffect(() => {
    setAdvancedFilters((prev) => {
      const next: Record<string, string> = {};
      campos.forEach((campo) => {
        next[campo.key] = prev[campo.key] ?? String(campo.value ?? "");
      });
      return next;
    });
  }, [campos]);

  useEffect(() => {
    applyCurrentFilters();
    // Reaplica filtros ativos quando a fonte de dados muda (ex.: apos CRUD).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyCurrentFilters();
  };

  const handleAdvancedChange = (key: string, value: string) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }));

    setCampos((prevCampos) =>
      prevCampos.map((campo) => (campo.key === key ? { ...campo, value } : campo))
    );
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    const clearedQuery = "";

    const clearedAdvanced = Object.keys(advancedFilters).reduce<Record<string, string>>(
      (acc, key) => {
        acc[key] = "";
        return acc;
      },
      {}
    );

    setGlobalQuery(clearedQuery);
    setAdvancedFilters(clearedAdvanced);
    setCampos((prevCampos) => prevCampos.map((campo) => ({ ...campo, value: "" })));
    applyCurrentFilters(clearedQuery, clearedAdvanced);
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = advancedFilters[field.key] || "";

    if (field.type === "select" && field.options) {
      return (
        <select
          key={field.key}
          value={fieldValue}
          onChange={(e) => handleAdvancedChange(field.key, e.target.value)}
          aria-label={field.placeholder}
          className="h-[46px] w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
        >
          <option value="">{field.placeholder}</option>
          {field.options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
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
        aria-label={field.placeholder}
        className="h-[46px] w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
      />
    );
  };

  return (
    <div className="skeleton flex w-full flex-col gap-4 rounded-[24px] border border-[#E4EEF0] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div>
        <p className="text-base font-semibold text-[#1F2A32]">Busca</p>
        <p className="-mt-1 text-sm text-[#8FA0A8]">Busca global + filtros avancados</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} aria-label={`Busca de ${nomePagina}`}>
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={globalQuery}
            placeholder={globalPlaceholder}
            onChange={(e) => setGlobalQuery(e.target.value)}
            aria-label="Busca global"
            className="h-[46px] w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
          />

          <div className="flex w-full flex-col gap-3 sm:flex-row md:ml-auto md:w-auto">
            {showCadastrarButton && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#58AFAE] px-5 font-semibold text-white transition hover:brightness-95 sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-white">add</span>
                Cadastrar
              </button>
            )}

            {hasAnyField && (
              <button
                type="button"
                onClick={toggleAdvanced}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-[#D5E3E6] bg-white px-5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-[#1F2A32]">
                  filter_alt
                </span>
                {showAdvanced ? "Ocultar" : "Filtrar"}
              </button>
            )}

            <button
              type="submit"
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#004C57] px-5 font-semibold text-white transition hover:brightness-95 sm:w-auto"
            >
              <span className="material-symbols-outlined text-base text-white">search</span>
              Buscar
            </button>
          </div>
        </div>

        {showAdvanced && hasAnyField && (
          <div className="animate-fadeIn flex flex-col gap-3 border-t border-[#E5EEF0] pt-4 md:flex-row md:items-center">
            {campos.map((field) => renderField(field))}
            <button
              type="button"
              onClick={clearFilters}
              className="h-[46px] w-full rounded-2xl border border-[#D5E3E6] bg-white px-5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] md:w-auto"
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
            fields={formFields}
            validationSchema={formValidationSchema}
            hiddenFields={formHiddenFields}
            onCancel={() => setModalOpen(false)}
            onConfirm={async (data) => {
              try {
                if (onCadastrar) {
                  await onCadastrar(data);
                }
                setModalOpen(false);
              } catch (error) {
                console.error("Erro ao cadastrar:", error);
                const message = error instanceof Error ? error.message : "Erro ao cadastrar. Tente novamente.";
                alert(message);
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export { SearchBar, type FieldConfig };
