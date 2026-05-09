"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/button";
import DocumentoField, { type DocumentoFieldValue } from "@/components/Form/documento-field";
import type { FormFieldConfig } from "@/components/Form/form";
import Input from "@/components/Input";
import { digitsOnly, normalizeDateInput, validateDespesaDateRange } from "@/global/formPayload";
import { authStorage } from "@/lib/auth-storage";

export type DespesaUcOption = {
  id: number;
  identificador: string;
  idInstituicao: number;
  instituicaoNome: string;
  idSecretaria: number;
  secretariaNome: string;
  idTipoCodigo?: number | null;
  tipoCodigoNome: string;
  idTipoDespesa: number;
  tipoDespesaNome: string;
  idUnidadeMedida?: number | null;
  unidadeMedidaNome: string;
  idFornecedor: number;
  fornecedorNome: string;
  idOrcamento: number;
  orcamentoLabel: string;
};

export type DespesaResponsavelOption = {
  value: number;
  label: string;
};

export type DespesaFluxoOption = {
  value: number;
  label: string;
};

export type DespesaFormMode = "create" | "edit" | "view";

export type DespesaFormValues = Record<string, unknown> & {
  idUnidadeConsumidora: number | "";
  uc: string;
  numeroDocumento: string;
  documento: DocumentoFieldValue | "";
  idFluxo: number | "";
  codigo: string;
  idTipoCodigo: number | "";
  idTipoDespesa: number | "";
  idInstituicao: number | "";
  idOrcamento: number | "";
  idFornecedor: number | "";
  idUsuario: number | "";
  valorPrevisto: number | "";
  valorPago: number | "";
  consumoPrevisto: number | "";
  consumoReal: number | "";
  dataEmicao: string;
  dataVencimento: string;
  situacao: number | "";
  status: number | "";
};

export type DespesaFormInitialValues = Partial<DespesaFormValues>;

type DespesaFormProps = {
  mode: DespesaFormMode;
  ucs: DespesaUcOption[];
  usuarios: DespesaResponsavelOption[];
  fluxos: DespesaFluxoOption[];
  initialValues?: DespesaFormInitialValues;
  onCancel: () => void;
  onConfirm?: (values: DespesaFormValues) => Promise<void> | void;
};

const STATUS_OPTIONS = [
  { value: 1, label: "A pagar" },
  { value: 2, label: "Paga" },
  { value: 3, label: "Atrasada" },
];

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const toNumberOrEmpty = (value: unknown): number | "" => {
  if (value === "" || value === undefined || value === null) return "";
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : "";
};

const buildInitialFormValues = (
  initialValues: DespesaFormInitialValues | undefined,
  currentUserId: number | null,
  mode: DespesaFormMode
): DespesaFormValues => {
  const isCreateMode = mode === "create";
  const defaultStatus = toNumberOrEmpty(
    initialValues?.situacao ?? initialValues?.status ?? 1
  );
  return {
    idUnidadeConsumidora: toNumberOrEmpty(initialValues?.idUnidadeConsumidora),
    uc: String(initialValues?.uc ?? ""),
    numeroDocumento: String(initialValues?.numeroDocumento ?? ""),
    documento: (initialValues?.documento as DocumentoFieldValue | "") ?? "",
    idFluxo: toNumberOrEmpty(initialValues?.idFluxo),
    codigo: String(initialValues?.codigo ?? ""),
    idTipoCodigo: toNumberOrEmpty(initialValues?.idTipoCodigo),
    idTipoDespesa: toNumberOrEmpty(initialValues?.idTipoDespesa),
    idInstituicao: toNumberOrEmpty(initialValues?.idInstituicao),
    idOrcamento: toNumberOrEmpty(initialValues?.idOrcamento),
    idFornecedor: toNumberOrEmpty(initialValues?.idFornecedor),
    idUsuario: toNumberOrEmpty(initialValues?.idUsuario ?? currentUserId ?? ""),
    valorPrevisto: toNumberOrEmpty(initialValues?.valorPrevisto),
    valorPago: toNumberOrEmpty(initialValues?.valorPago ?? (isCreateMode ? 0 : "")),
    consumoPrevisto: toNumberOrEmpty(initialValues?.consumoPrevisto),
    consumoReal: toNumberOrEmpty(initialValues?.consumoReal ?? (isCreateMode ? 0 : "")),
    dataEmicao: normalizeDateInput(initialValues?.dataEmicao) ?? getTodayDate(),
    dataVencimento: normalizeDateInput(initialValues?.dataVencimento) ?? getTodayDate(),
    situacao: defaultStatus,
    status: defaultStatus,
  };
};

const validatePositiveNumber = (value: unknown, label: string) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0)
    return `${label} deve ser maior que zero.`;
  return undefined;
};

const validateOptionalNonNegativeNumber = (value: unknown, label: string) => {
  if (value === "" || value === undefined || value === null) return undefined;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0)
    return `${label} nao pode ser negativo.`;
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const resolveDocumentoValue = (value: unknown): DocumentoFieldValue | null => {
  if (!isRecord(value)) return null;
  if (typeof value.digitalizacao !== "string" || value.digitalizacao.trim().length === 0) {
    return null;
  }
  return value as DocumentoFieldValue;
};

const selectClassName =
  "w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[#E3E7EA] disabled:bg-[#F4F6F8] disabled:text-[#9AA5AD]";

// ---------------------------------------------------------------------------
// Subcomponentes internos
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)] whitespace-nowrap">
        {children}
      </p>
      <div className="h-px flex-1 bg-[var(--border-soft)]" />
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground-muted)]">
        {label}
      </span>
      <div className="min-h-[36px] rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--foreground)] truncate">
        {value || <span className="italic text-[var(--foreground-muted)]">—</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function DespesaForm({
  mode,
  ucs,
  usuarios,
  fluxos,
  initialValues,
  onCancel,
  onConfirm,
}: DespesaFormProps) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const [currentAuthUser, setCurrentAuthUser] = useState(() => authStorage.get());
  const currentUserId = currentAuthUser?.id ?? null;

  const [search, setSearch] = useState("");
  const [selectedUc, setSelectedUc] = useState<DespesaUcOption | null>(null);
  const [formValues, setFormValues] = useState<DespesaFormValues>(() =>
    buildInitialFormValues(initialValues, currentUserId, mode)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const documentoField: FormFieldConfig = useMemo(
    () => ({
      key: "documento",
      label: "Documento",
      type: "documento",
      accept: ".pdf,.png,.jpg,.jpeg,image/*,application/pdf",
    }),
    []
  );

  const filteredUcs = useMemo(() => {
    const q = search.toLowerCase();
    return ucs.filter(
      (uc) =>
        String(uc.id).includes(q) ||
        uc.identificador.toLowerCase().includes(q)
    );
  }, [ucs, search]);

  const selectedUcSummary = useMemo(
    () => ({
      instituicao: selectedUc?.instituicaoNome ?? "",
      secretaria: selectedUc?.secretariaNome ?? "",
      tipoCodigo: selectedUc?.tipoCodigoNome ?? "",
      tipoDespesa: selectedUc?.tipoDespesaNome ?? "",
      unidadeMedida: selectedUc?.unidadeMedidaNome ?? "",
      fornecedor: selectedUc?.fornecedorNome ?? "",
      orcamento: selectedUc?.orcamentoLabel ?? "",
    }),
    [selectedUc]
  );

  useEffect(() => {
    setCurrentAuthUser(authStorage.get());
  }, []);

  useEffect(() => {
    const nextValues = buildInitialFormValues(initialValues, currentUserId, mode);
    setFormValues(nextValues);
    setErrors({});
    const initialUcId = Number(nextValues.idUnidadeConsumidora);
    if (!Number.isFinite(initialUcId) || initialUcId <= 0) {
      setSelectedUc(null);
      return;
    }
    setSelectedUc(ucs.find((uc) => uc.id === initialUcId) ?? null);
  }, [currentUserId, initialValues, mode, ucs]);

  useEffect(() => {
    if (!selectedUc) {
      setFormValues((v) => ({
        ...v,
        idUnidadeConsumidora: "",
        uc: "",
        idTipoCodigo: "",
        idTipoDespesa: "",
        idInstituicao: "",
        idOrcamento: "",
        idFornecedor: "",
      }));
      return;
    }
    setFormValues((v) => ({
      ...v,
      idUnidadeConsumidora: selectedUc.id,
      uc: selectedUc.identificador,
      idTipoCodigo: selectedUc.idTipoCodigo ?? "",
      idTipoDespesa: selectedUc.idTipoDespesa,
      idInstituicao: selectedUc.idInstituicao,
      idOrcamento: selectedUc.idOrcamento,
      idFornecedor: selectedUc.idFornecedor,
      codigo:
        v.codigo && String(v.codigo).trim().length > 0
          ? v.codigo
          : selectedUc.identificador,
    }));
  }, [selectedUc]);

  const handleSelectUc = (uc: DespesaUcOption) => {
    if (isViewMode) return;
    setSelectedUc(uc);
    setErrors((e) => ({
      ...e,
      idUnidadeConsumidora: "",
      uc: "",
      idInstituicao: "",
      idOrcamento: "",
      idFornecedor: "",
    }));
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    uc: DespesaUcOption
  ) => {
    if (isViewMode) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectUc(uc);
    }
  };

  const handleValueChange = <K extends keyof DespesaFormValues>(
    key: K,
    value: DespesaFormValues[K]
  ) => {
    setFormValues((v) => ({ ...v, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key]: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isViewMode || !onConfirm) return;

    const nextErrors: Record<string, string> = {};

    if (!selectedUc) {
      nextErrors.idUnidadeConsumidora = "Selecione uma UC na tabela ao lado.";
    }

    const numeroDocumento = digitsOnly(formValues.numeroDocumento);
    if (!numeroDocumento)
      nextErrors.numeroDocumento = "Numero do documento deve conter apenas numeros.";

    const hasDocumentoInput = formValues.documento !== "" && formValues.documento !== undefined && formValues.documento !== null;
    const documentoValue = resolveDocumentoValue(formValues.documento);
    if (isCreateMode || hasDocumentoInput) {
      if (!documentoValue) {
        nextErrors.documento = "Selecione um arquivo e aguarde a conversao para Base64.";
      }

      if (!Number(formValues.idFluxo)) {
        nextErrors.idFluxo = "Selecione um fluxo valido.";
      }
    }

    if (String(formValues.codigo ?? "").trim().length > 100)
      nextErrors.codigo = "Codigo deve ter no maximo 100 caracteres.";

    const valorPrevistoError = validatePositiveNumber(formValues.valorPrevisto, "Valor previsto");
    if (valorPrevistoError) nextErrors.valorPrevisto = valorPrevistoError;

    const valorPagoError = validateOptionalNonNegativeNumber(formValues.valorPago, "Valor pago");
    if (valorPagoError) nextErrors.valorPago = valorPagoError;

    const consumoPrevistoError = validateOptionalNonNegativeNumber(formValues.consumoPrevisto, "Consumo previsto");
    if (consumoPrevistoError) nextErrors.consumoPrevisto = consumoPrevistoError;

    const consumoRealError = validateOptionalNonNegativeNumber(formValues.consumoReal, "Consumo real");
    if (consumoRealError) nextErrors.consumoReal = consumoRealError;

    const normalizedDataEmicao = normalizeDateInput(formValues.dataEmicao);
    if (!normalizedDataEmicao) nextErrors.dataEmicao = "Data de emissao invalida.";

    const normalizedDataVencimento = normalizeDateInput(formValues.dataVencimento);
    if (!normalizedDataVencimento) nextErrors.dataVencimento = "Data de vencimento invalida.";

    const dateRangeError = validateDespesaDateRange(normalizedDataEmicao, normalizedDataVencimento);
    if (dateRangeError) nextErrors.dataVencimento = dateRangeError;

    const resolvedResponsibleUserId =
      Number(formValues.idUsuario) || currentUserId || authStorage.get()?.id || null;
    if (!resolvedResponsibleUserId)
      nextErrors.idUsuario = "Selecione um usuario responsavel.";

    const resolvedStatus = isCreateMode ? 1 : Number(formValues.situacao);
    if (!resolvedStatus) nextErrors.situacao = "Selecione um status financeiro.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const resolvedDocumento = documentoValue
      ? {
          ...documentoValue,
          numeroDocumento: Number(numeroDocumento),
          idFornecedor: Number(selectedUc?.idFornecedor ?? formValues.idFornecedor ?? 0),
          idFluxo: Number(formValues.idFluxo),
        }
      : formValues.documento;

    await onConfirm({
      ...formValues,
      documento: resolvedDocumento,
      numeroDocumento,
      idFluxo: formValues.idFluxo,
      idUsuario: Number(resolvedResponsibleUserId),
      valorPago: isCreateMode ? 0 : formValues.valorPago,
      consumoReal: isCreateMode ? 0 : formValues.consumoReal,
      dataEmicao: normalizedDataEmicao ?? "",
      dataVencimento: normalizedDataVencimento ?? "",
      status: resolvedStatus,
      situacao: resolvedStatus,
      uc: selectedUc?.identificador ?? formValues.uc,
      idUnidadeConsumidora: selectedUc?.id ?? formValues.idUnidadeConsumidora,
      idTipoCodigo: selectedUc?.idTipoCodigo ?? formValues.idTipoCodigo,
      idTipoDespesa: selectedUc?.idTipoDespesa ?? formValues.idTipoDespesa,
      idInstituicao: selectedUc?.idInstituicao ?? formValues.idInstituicao,
      idOrcamento: selectedUc?.idOrcamento ?? formValues.idOrcamento,
      idFornecedor: selectedUc?.idFornecedor ?? formValues.idFornecedor,
    });
  };

  return (
    <form className="flex h-full flex-col overflow-hidden" onSubmit={handleSubmit}>
      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-[var(--border-soft)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
          Formulario de despesa
        </p>
        <h3 className="mt-1.5 text-2xl font-semibold text-[var(--secundary-1)]">
          Selecione uma UC e registre o gasto
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
          Escolha a unidade consumidora ao lado. Os vinculos da despesa serao
          preenchidos automaticamente sempre que a UC for selecionada.
        </p>
      </header>

      {/* Body: dois painéis lado a lado */}
      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden">

        {/* ── Painel esquerdo: lista de UCs ── */}
        <div className="flex flex-col overflow-hidden border-r border-[var(--border-soft)]">
          {/* Busca */}
          <div className="flex-shrink-0 border-b border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Unidades consumidoras
            </p>
            <div className="flex items-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-2.5 focus-within:border-[var(--primary-1)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)] transition-all">
              <span className="material-symbols-outlined !text-[16px] text-[var(--foreground-muted)]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por ID ou identificador..."
                className="w-full bg-transparent py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {ucs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--foreground-muted)]">
                Nenhuma UC disponivel no momento.
              </p>
            ) : filteredUcs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--foreground-muted)]">
                Nenhuma UC encontrada.
              </p>
            ) : (
              <div className="flex flex-col gap-1 p-2">
                {filteredUcs.map((uc) => {
                  const isSelected = selectedUc?.id === uc.id;
                  return (
                    <button
                      key={uc.id}
                      type="button"
                      tabIndex={isViewMode ? -1 : 0}
                      aria-selected={isSelected}
                      disabled={isViewMode}
                      onClick={() => handleSelectUc(uc)}
                      onKeyDown={(e) => handleRowKeyDown(e as any, uc)}
                      className={`flex w-full items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-default ${
                        isSelected
                          ? "border-[var(--border-accent-teal)] bg-[var(--surface-subtle)] ring-1 ring-[var(--border-accent-teal)]"
                          : "border-transparent bg-transparent hover:border-[var(--border-soft)] hover:bg-[var(--surface-subtle)]"
                      }`}
                    >
                      <span
                        className={`min-w-[32px] text-[11px] font-semibold ${
                          isSelected
                            ? "text-[var(--text-accent-teal)]"
                            : "text-[var(--foreground-muted)]"
                        }`}
                      >
                        {String(uc.id).padStart(3, "0")}
                      </span>
                      <span
                        className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm ${
                          isSelected
                            ? "font-semibold text-[var(--text-accent-teal)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {uc.identificador}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined !text-[14px] text-[var(--text-accent-teal)]">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {errors.idUnidadeConsumidora && (
            <p className="flex-shrink-0 border-t border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-[#C23D3D]">
              {errors.idUnidadeConsumidora}
            </p>
          )}
        </div>

        {/* ── Painel direito: UC selecionada + campos ── */}
        <div className="flex flex-col overflow-hidden">
          {/* Chip da UC */}
          <div className="flex-shrink-0 border-b border-[var(--border-soft)] bg-[var(--surface-subtle)] px-5 py-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              UC selecionada
            </p>
            <div
              className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-xs font-semibold transition-all ${
                selectedUc
                  ? "border-[var(--border-accent-teal)] bg-[var(--surface-subtle)] text-[var(--text-accent-teal)]"
                  : "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]"
              }`}
            >
              <span className="material-symbols-outlined !text-[13px]">
                {selectedUc ? "business" : "radio_button_unchecked"}
              </span>
              {selectedUc
                ? `${String(selectedUc.id).padStart(3, "0")} — ${selectedUc.identificador}`
                : "Sem selecao — clique em uma UC"}
            </div>
          </div>

          {/* Scroll dos campos */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!selectedUc ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <span className="material-symbols-outlined !text-[36px] text-[var(--foreground-muted)] opacity-30">
                  corporate_fare
                </span>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Selecione uma Unidade Consumidora para preencher os dados da despesa
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Vínculos */}
                <div>
                  <SectionLabel>Vinculos preenchidos pela UC</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <ReadonlyField
                      label="UC (ID)"
                      value={
                        formValues.idUnidadeConsumidora
                          ? String(formValues.idUnidadeConsumidora).padStart(3, "0")
                          : ""
                      }
                    />
                    <ReadonlyField label="Identificador UC" value={formValues.uc} />
                    <ReadonlyField label="Instituicao" value={selectedUcSummary.instituicao} />
                    <ReadonlyField label="Secretaria" value={selectedUcSummary.secretaria} />
                    <ReadonlyField label="Tipo de codigo" value={selectedUcSummary.tipoCodigo} />
                    <ReadonlyField label="Categoria" value={selectedUcSummary.tipoDespesa} />
                    <ReadonlyField label="Orcamento" value={selectedUcSummary.orcamento} />
                    <ReadonlyField label="Fornecedor" value={selectedUcSummary.fornecedor} />
                  </div>
                </div>

                {/* Dados da despesa */}
                <div>
                  <SectionLabel>Dados da despesa</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Numero do documento"
                      placeholder="Somente numeros"
                      required={!isViewMode}
                      disabled={isViewMode}
                      value={formValues.numeroDocumento}
                      error={errors.numeroDocumento}
                      onChange={(e) => handleValueChange("numeroDocumento", e.target.value)}
                    />
                    <Input
                      label="Data de emissao"
                      type="date"
                      required={!isViewMode}
                      disabled={isViewMode}
                      value={formValues.dataEmicao}
                      error={errors.dataEmicao}
                      onChange={(e) => handleValueChange("dataEmicao", e.target.value)}
                    />
                    <Input
                      label="Data de vencimento"
                      type="date"
                      required={!isViewMode}
                      disabled={isViewMode}
                      value={formValues.dataVencimento}
                      error={errors.dataVencimento}
                      onChange={(e) => handleValueChange("dataVencimento", e.target.value)}
                    />
                    <Input
                      label="Valor previsto em R$"
                      placeholder="0,00"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      required={!isViewMode}
                      disabled={isViewMode}
                      value={formValues.valorPrevisto}
                      error={errors.valorPrevisto}
                      onChange={(e) =>
                        handleValueChange("valorPrevisto", e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                    <Input
                      label={`Consumo previsto em ${selectedUcSummary.unidadeMedida || "—"}`}
                      placeholder="0"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      required={!isViewMode}
                      disabled={isViewMode}
                      value={formValues.consumoPrevisto}
                      error={errors.consumoPrevisto}
                      onChange={(e) =>
                        handleValueChange("consumoPrevisto", e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />

                    {!isViewMode ? (
                      <div className="col-span-2 grid gap-3 md:grid-cols-2">
                        <div>
                          <DocumentoField
                            field={documentoField}
                            value={formValues.documento}
                            error={errors.documento}
                            onChange={(field, value) => handleValueChange(field.key as "documento", value)}
                            disabled={isViewMode}
                            required={isCreateMode}
                            label="Documento"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]">
                            Fluxo do documento
                            {!isViewMode && (isCreateMode || formValues.documento) && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </label>
                          <select
                            value={formValues.idFluxo}
                            disabled={isViewMode}
                            className={selectClassName}
                            onChange={(e) =>
                              handleValueChange("idFluxo", e.target.value === "" ? "" : Number(e.target.value))
                            }
                          >
                            <option value="">Selecione o fluxo</option>
                            {fluxos.map((fluxo) => (
                              <option key={fluxo.value} value={fluxo.value}>
                                {fluxo.label}
                              </option>
                            ))}
                          </select>
                          {errors.idFluxo && (
                            <p className="text-sm font-medium text-[#C23D3D]">{errors.idFluxo}</p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {isCreateMode ? (
                      <div className="col-span-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                          Definicoes automaticas do cadastro
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-[var(--foreground-muted)]">
                          <p>
                            Status inicial:{" "}
                            <span className="font-semibold text-[var(--foreground)]">A pagar</span>
                          </p>
                          <p>
                            Usuario responsavel:{" "}
                            <span className="font-semibold text-[var(--foreground)]">
                              {currentAuthUser?.nome ?? "Usuario autenticado"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Input
                          label="Valor pago"
                          placeholder="0,00"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          disabled={isViewMode}
                          value={formValues.valorPago}
                          error={errors.valorPago}
                          onChange={(e) =>
                            handleValueChange("valorPago", e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <Input
                          label="Consumo real"
                          placeholder="0"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          disabled={isViewMode}
                          value={formValues.consumoReal}
                          error={errors.consumoReal}
                          onChange={(e) =>
                            handleValueChange("consumoReal", e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]">
                            Usuario responsavel
                            {!isViewMode && <span className="ml-1 text-red-500">*</span>}
                          </label>
                          <select
                            value={formValues.idUsuario}
                            disabled={isViewMode}
                            required={!isViewMode}
                            className={selectClassName}
                            onChange={(e) =>
                              handleValueChange("idUsuario", e.target.value === "" ? "" : Number(e.target.value))
                            }
                          >
                            <option value="">Selecione o usuario</option>
                            {usuarios.map((u) => (
                              <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                          </select>
                          {errors.idUsuario && (
                            <p className="text-sm font-medium text-[#C23D3D]">{errors.idUsuario}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]">
                            Status financeiro
                            {!isViewMode && <span className="ml-1 text-red-500">*</span>}
                          </label>
                          <select
                            value={formValues.situacao}
                            disabled={isViewMode}
                            required={!isViewMode}
                            className={selectClassName}
                            onChange={(e) =>
                              handleValueChange("situacao", e.target.value === "" ? "" : Number(e.target.value))
                            }
                          >
                            <option value="">Selecione o status</option>
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          {errors.situacao && (
                            <p className="text-sm font-medium text-[#C23D3D]">{errors.situacao}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer com ações */}
          <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-[var(--divider)] bg-[var(--surface-subtle)] px-5 py-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              type="button"
            >
              {isViewMode ? "Fechar" : "Cancelar"}
            </Button>
            {!isViewMode && (
              <Button type="submit">
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}