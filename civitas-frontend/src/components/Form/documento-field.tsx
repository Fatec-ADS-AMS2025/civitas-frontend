"use client";

import React, { useMemo } from "react";
import type { FormFieldConfig } from "./form";
import { getFieldErrorId } from "./form-utils";

export type DocumentoFieldValue = {
  idDocumento: number;
  digitalizacao: string;
  numeroDocumento: number;
  idFornecedor: number;
  idFluxo: number;
};

export type DocumentoFieldOption = {
  value: number;
  label: string;
  documento: DocumentoFieldValue;
};

type DocumentoFieldProps = {
  field: FormFieldConfig;
  value: unknown;
  error?: string;
  onChange: (field: FormFieldConfig, value: unknown) => void;
  disabled: boolean;
  required: boolean;
  label: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toNumber = (value: unknown): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getSelectedDocumentId = (value: unknown): number => {
  if (isRecord(value)) {
    return toNumber(value.idDocumento);
  }

  return toNumber(value);
};

const hasBase64Content = (value: unknown): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

export default function DocumentoField({
  field,
  value,
  error,
  onChange,
  disabled,
  required,
  label,
}: DocumentoFieldProps) {
  const errorId = getFieldErrorId(field.key);
  const selectedId = getSelectedDocumentId(value);
  const options = field.documentOptions ?? [];
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedId),
    [options, selectedId]
  );
  const selectedDocumento = selectedOption?.documento;
  const isLoading = Boolean(field.documentLoading);
  const isEmpty = !isLoading && options.length === 0;
  const helperMessage =
    field.documentError ??
    (isLoading
      ? "Carregando documentos..."
      : isEmpty
        ? "Nenhum documento disponivel."
        : undefined);

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        value={selectedId > 0 ? String(selectedId) : ""}
        required={false}
        aria-required={required}
        disabled={disabled || isLoading || isEmpty}
        onChange={(event) => {
          const nextOption = options.find(
            (option) => String(option.value) === event.target.value
          );
          onChange(field, nextOption?.documento ?? "");
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[#E3E7EA] disabled:bg-[#F4F6F8] disabled:text-[#9AA5AD]"
      >
        <option value="" disabled>
          {field.placeholder ?? "Selecione um documento"}
        </option>
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>

      {helperMessage && !error ? (
        <p className="mt-1.5 text-sm text-[var(--foreground-soft)]">
          {helperMessage}
        </p>
      ) : null}

      {selectedDocumento ? (
        <div className="civitas-documento-field__summary mt-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3 text-sm text-[var(--foreground)]">
          <div className="grid gap-2 sm:grid-cols-2">
            <span>
              <strong className="font-semibold">Numero:</strong>{" "}
              {selectedDocumento.numeroDocumento}
            </span>
            <span>
              <strong className="font-semibold">Fornecedor:</strong>{" "}
              #{selectedDocumento.idFornecedor}
            </span>
            <span>
              <strong className="font-semibold">Fluxo:</strong>{" "}
              #{selectedDocumento.idFluxo}
            </span>
            <span>
              <strong className="font-semibold">Digitalizacao:</strong>{" "}
              {hasBase64Content(selectedDocumento.digitalizacao)
                ? "Base64 disponivel"
                : "Sem arquivo"}
            </span>
          </div>
        </div>
      ) : null}

      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
