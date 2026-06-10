"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Form, {
  type FormExtraContentRenderArgs,
  type FormFieldConfig,
  type ValidationFn,
} from "../Form/form";
import Modal from "../modal";
import {
  applySearchFilters,
  type SearchFieldConfig,
} from "./search-utils";
import { showToast } from "@/hooks/useToast";

type FieldConfig = SearchFieldConfig;

type SearchBarProps = {
  campos: FieldConfig[];
  setCampos?: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
  camposFiltro?: FieldConfig[];
  dados: any[];
  setDados: React.Dispatch<React.SetStateAction<any>>;
  onCadastrar?: (data: any) => Promise<any>;
  showCadastrarButton?: boolean;
  model: object | string[];
  formFields?: FormFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
  formRenderExtraContent?: (args: FormExtraContentRenderArgs) => React.ReactNode;
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
  formRenderExtraContent,
}: SearchBarProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [advancedFilterOverrides, setAdvancedFilterOverrides] = useState<Record<string, string>>({});

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

  const advancedFilters = useMemo(() => {
    return campos.reduce<Record<string, string>>((acc, campo) => {
      acc[campo.key] = advancedFilterOverrides[campo.key] ?? String(campo.value ?? "");
      return acc;
    }, {});
  }, [advancedFilterOverrides, campos]);

  useEffect(() => {
    const filteredData = applySearchFilters(dados, campos, globalQuery, advancedFilters);
    setDados(filteredData);
  }, [dados, campos, globalQuery, advancedFilters, setDados]);

  const handleAdvancedChange = (key: string, value: string) => {
    setAdvancedFilterOverrides((prev) => ({ ...prev, [key]: value }));

    setCampos?.((prevCampos) =>
      prevCampos.map((campo) => (campo.key === key ? { ...campo, value } : campo))
    );
  };

  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.form ?? e.currentTarget.closest("form, div");
      if (!form) return;

      const selectors =
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])";
      const focusables = Array.from(form.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => el.offsetParent !== null
      );
      const index = focusables.indexOf(e.currentTarget as HTMLElement);
      const next = focusables[index + 1];
      if (next) {
        next.focus();
      }
    }
  };

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const clearFilters = () => {
    setGlobalQuery("");

    setAdvancedFilterOverrides({});
    setCampos?.((prevCampos) => prevCampos.map((campo) => ({ ...campo, value: "" })));
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = advancedFilters[field.key] || "";

    if (field.type === "select" && field.options) {
      return (
        <select
          key={field.key}
          value={fieldValue}
          onChange={(e) => handleAdvancedChange(field.key, e.target.value)}
          className="civitas-searchbar__field civitas-control w-full flex-1 px-4 py-2.5 text-sm md:w-auto"
          onKeyDown={handleFieldKeyDown}
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
        onKeyDown={handleFieldKeyDown}
        className="civitas-searchbar__field civitas-control w-full flex-1 px-4 py-2.5 text-sm md:w-auto"
      />
    );
  };

  return (
    <div className="civitas-searchbar civitas-surface civitas-enter flex w-full flex-col gap-4 p-5">
      <div className="civitas-panel-header">
        <p className="civitas-searchbar__title text-base font-semibold text-[var(--foreground)]">Busca</p>
        <p className="civitas-searchbar__description -mt-1 text-sm text-[var(--foreground-soft)]">Busca global + filtros avancados</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <input
          type="text"
          value={globalQuery}
          placeholder={globalPlaceholder}
          onChange={(e) => setGlobalQuery(e.target.value)}
          className="civitas-searchbar__field civitas-control w-full flex-1 px-4 py-2.5 text-sm md:w-auto"
        />

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          {showCadastrarButton && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="civitas-searchbar__action civitas-action civitas-action--primary flex w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base text-inherit">add</span>
              Cadastrar
            </button>
          )}

          {hasAnyField && (
            <button
              type="button"
              onClick={toggleAdvanced}
              className="civitas-searchbar__action civitas-action civitas-action--ghost flex w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base text-inherit">
                filter_alt
              </span>
              {showAdvanced ? "Ocultar" : "Filtrar"}
            </button>
          )}
        </div>
      </div>

      {showAdvanced && hasAnyField && (
        <div className="civitas-searchbar__advanced civitas-enter flex flex-col gap-3 border-t border-[var(--divider)] pt-4 md:flex-row md:items-center">
          {campos.map((field) => renderField(field))}
          <button
            type="button"
            onClick={clearFilters}
            className="civitas-searchbar__action civitas-action civitas-action--ghost w-full md:w-auto"
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
            fields={formFields}
            validationSchema={formValidationSchema}
            hiddenFields={formHiddenFields}
            renderExtraContent={formRenderExtraContent}
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
                showToast(message, "error");
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export { SearchBar, type FieldConfig };
