"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Form, {
  type FormFieldConfig,
  type ValidationFn,
} from "../Form/form";
import Modal from "../modal";
import { toast } from "@/components/Toaster";
import { getUserFriendlyErrorMessage } from "@/hooks/generic";
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
    const filteredData = applySearchFilters(dados, campos, globalQuery, advancedFilters);
    setDados(filteredData);
  }, [dados, campos, globalQuery, advancedFilters, setDados]);

  const handleAdvancedChange = (key: string, value: string) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }));

    setCampos((prevCampos) =>
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
          className="w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
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
        className="w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
      />
    );
  };

  return (
    <div className="skeleton flex w-full flex-col gap-4 rounded-[24px] border border-[#E4EEF0] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div>
        <p className="text-base font-semibold text-[#1F2A32]">Busca</p>
        <p className="-mt-1 text-sm text-[#8FA0A8]">Busca global + filtros avancados</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <input
          type="text"
          value={globalQuery}
          placeholder={globalPlaceholder}
          onChange={(e) => setGlobalQuery(e.target.value)}
          className="w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
        />

        <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
          {showCadastrarButton && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58AFAE] px-5 py-2.5 font-semibold text-white transition hover:brightness-95 sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">add</span>
              Cadastrar
            </button>
          )}

          {hasAnyField && (
            <button
              type="button"
              onClick={toggleAdvanced}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D5E3E6] bg-white px-5 py-2.5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] sm:w-auto"
            >
              <span className="material-symbols-outlined text-[#1F2A32] text-base">
                filter_alt
              </span>
              {showAdvanced ? "Ocultar" : "Filtrar"}
            </button>
          )}
        </div>
      </div>

      {showAdvanced && hasAnyField && (
        <div className="animate-fadeIn flex flex-col gap-3 border-t border-[#E5EEF0] pt-4 md:flex-row md:items-center">
          {campos.map((field) => renderField(field))}
          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-2xl border border-[#D5E3E6] bg-white px-5 py-2.5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] md:w-auto"
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
            onCancel={() => setModalOpen(false)}
            onConfirm={async (data) => {
              try {
                if (onCadastrar) {
                  await onCadastrar(data);
                }
                toast.success(`${nomePagina} cadastrado com sucesso.`);
                setModalOpen(false);
              } catch (error) {
                console.error("Erro ao cadastrar:", error);
                toast.error(getUserFriendlyErrorMessage(error));
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export { SearchBar, type FieldConfig };
