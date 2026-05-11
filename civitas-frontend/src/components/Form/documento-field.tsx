"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import type { FormFieldConfig } from "./form";
import { getFieldErrorId } from "./form-utils";

export type DocumentoUploadStatus = "idle" | "loading" | "ready" | "error";

export type DocumentoFieldValue = {
  idDocumento: number;
  digitalizacao: string;
  numeroDocumento: number;
  idFornecedor: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status?: DocumentoUploadStatus;
  errorMessage?: string;
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

const getDocumentoValue = (value: unknown): DocumentoFieldValue | null => {
  if (!isRecord(value)) return null;

  return {
    idDocumento: toNumber(value.idDocumento),
    digitalizacao: typeof value.digitalizacao === "string" ? value.digitalizacao : "",
    numeroDocumento: toNumber(value.numeroDocumento),
    idFornecedor: toNumber(value.idFornecedor),
    fileName: typeof value.fileName === "string" ? value.fileName : undefined,
    fileType: typeof value.fileType === "string" ? value.fileType : undefined,
    fileSize: toNumber(value.fileSize),
    status: getUploadStatus(value.status),
    errorMessage: typeof value.errorMessage === "string" ? value.errorMessage : undefined,
  };
};

const getUploadStatus = (status: unknown): DocumentoUploadStatus => {
  if (status === "loading" || status === "ready" || status === "error") return status;
  return "idle";
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  let nextSize = bytes;
  let unitIndex = 0;

  while (nextSize >= 1024 && unitIndex < units.length - 1) {
    nextSize /= 1024;
    unitIndex += 1;
  }

  return `${nextSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Nao foi possivel converter o arquivo para Base64."));
        return;
      }

      // FileReader retorna um Data URL; a API espera apenas o conteudo Base64 cru.
      const [, rawBase64 = ""] = reader.result.split(",", 2);
      if (!rawBase64) {
        reject(new Error("Arquivo convertido sem conteudo Base64."));
        return;
      }

      resolve(rawBase64);
    };

    reader.readAsDataURL(file);
  });
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
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const errorId = getFieldErrorId(field.key);
  const documento = getDocumentoValue(value);
  const status = documento?.status ?? "idle";
  const hasFile = Boolean(documento?.digitalizacao);
  const isConverting = status === "loading";
  const isDisabled = disabled || isConverting;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const previewUrl = useMemo(() => {
    if (!documento?.digitalizacao || !documento?.fileType) return "";
    return `data:${documento.fileType};base64,${documento.digitalizacao}`;
  }, [documento?.digitalizacao, documento?.fileType]);

  const isImagePreview = Boolean(documento?.fileType?.startsWith("image/"));
  const isPdfPreview = Boolean(documento?.fileType?.includes("pdf"));
  const canPreview = hasFile && (isImagePreview || isPdfPreview);

  const statusMessage = useMemo(() => {
    if (status === "loading") return "Convertendo arquivo para Base64...";
    if (status === "ready" && hasFile) return "Arquivo pronto para envio.";
    if (status === "error") return documento?.errorMessage ?? "Erro ao converter arquivo.";
    return "Nenhum arquivo selecionado.";
  }, [documento?.errorMessage, hasFile, status]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      onChange(field, "");
      return;
    }

    const baseValue: DocumentoFieldValue = {
      idDocumento: 0,
      digitalizacao: "",
      numeroDocumento: documento?.numeroDocumento ?? 0,
      idFornecedor: documento?.idFornecedor ?? 0,
      fileName: file.name,
      fileType: file.type || "Tipo nao informado",
      fileSize: file.size,
      status: "loading",
    };

    onChange(field, baseValue);

    try {
      const digitalizacao = await readFileAsBase64(file);
      onChange(field, {
        ...baseValue,
        digitalizacao,
        status: "ready",
      });
    } catch (conversionError) {
      const message =
        conversionError instanceof Error
          ? conversionError.message
          : "Nao foi possivel converter o arquivo.";

      onChange(field, {
        ...baseValue,
        status: "error",
        errorMessage: message,
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setIsPreviewOpen(false);
    onChange(field, "");
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] p-3 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus-within:border-[var(--primary-1)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)]">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={field.accept ?? ".pdf,.png,.jpg,.jpeg,image/*,application/pdf"}
          disabled={isDisabled}
          required={false}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : `${inputId}-status`}
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--foreground)]">
              {documento?.fileName ?? "Selecione um documento"}
            </p>
            <p id={`${inputId}-status`} className="mt-1 text-xs text-[var(--foreground-soft)]" aria-live="polite">
              {statusMessage}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => inputRef.current?.click()}
              className="civitas-action civitas-action--ghost min-h-10 rounded-sm px-3 text-xs font-semibold"
            >
              <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">
                upload_file
              </span>
              {hasFile ? "Trocar arquivo" : "Escolher arquivo"}
            </button>

            {canPreview ? (
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => setIsPreviewOpen((current) => !current)}
                className="civitas-action civitas-action--ghost min-h-10 rounded-sm px-3 text-xs font-semibold"
              >
                <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">
                  {isPreviewOpen ? "visibility_off" : "visibility"}
                </span>
                {isPreviewOpen ? "Ocultar" : "Pre-visualizar"}
              </button>
            ) : null}

            {documento ? (
              <button
                type="button"
                disabled={disabled || isConverting}
                onClick={handleClear}
                className="civitas-action civitas-action--ghost min-h-10 rounded-sm px-3 text-xs font-semibold text-[#B42318]"
              >
                <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">
                  close
                </span>
                Remover
              </button>
            ) : null}
          </div>
        </div>

        {documento ? (
          <div className="civitas-documento-field__summary mt-3 grid gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3 text-xs text-[var(--foreground-muted)] sm:grid-cols-2">
            <span className="min-w-0 truncate">
              <strong className="font-semibold text-[var(--foreground)]">Nome:</strong>{" "}
              {documento.fileName ?? "-"}
            </span>
            <span>
              <strong className="font-semibold text-[var(--foreground)]">Tipo:</strong>{" "}
              {documento.fileType || "Tipo nao informado"}
            </span>
            <span>
              <strong className="font-semibold text-[var(--foreground)]">Tamanho:</strong>{" "}
              {formatFileSize(documento.fileSize)}
            </span>
            <span>
              <strong className="font-semibold text-[var(--foreground)]">Status:</strong>{" "}
              {statusMessage}
            </span>
          </div>
        ) : null}

        {canPreview && isPreviewOpen ? (
          <div className="mt-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3">
            {isImagePreview ? (
              <img
                src={previewUrl}
                alt={documento?.fileName ?? "Pre-visualizacao"}
                className="max-h-[320px] w-full rounded-sm object-contain"
              />
            ) : null}

            {isPdfPreview ? (
              <iframe
                title={documento?.fileName ?? "Pre-visualizacao"}
                src={previewUrl}
                className="h-[360px] w-full rounded-sm border border-[var(--border-default)]"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
