"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/button";
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
  idFornecedor: number;
  fornecedorNome: string;
  idOrcamento: number;
  orcamentoLabel: string;
};

export type DespesaResponsavelOption = {
  value: number;
  label: string;
};

export type DespesaFormMode = "create" | "edit" | "view";

export type DespesaFormValues = Record<string, unknown> & {
  idUnidadeConsumidora: number | "";
  uc: string;
  numeroDocumento: string;
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
  initialValues?: DespesaFormInitialValues;
  onCancel: () => void;
  onConfirm?: (values: DespesaFormValues) => Promise<void> | void;
};

const STATUS_OPTIONS = [
  { value: 1, label: "A pagar" },
  { value: 2, label: "Paga" },
  { value: 3, label: "Atrasada" },
];

const ucSelectionMessage = "Selecione uma UC na tabela ao lado.";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const toNumberOrEmpty = (value: unknown): number | "" => {
  if (value === "" || value === undefined || value === null) {
    return "";
  }

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
    dataVencimento:
      normalizeDateInput(initialValues?.dataVencimento) ?? getTodayDate(),
    situacao: defaultStatus,
    status: defaultStatus,
  };
};

const validatePositiveNumber = (value: unknown, label: string) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return `${label} deve ser maior que zero.`;
  }

  return undefined;
};

const validateOptionalNonNegativeNumber = (value: unknown, label: string) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return `${label} nao pode ser negativo.`;
  }

  return undefined;
};

const getUcRowClassName = (isSelected: boolean, disabled: boolean) => {
  return `group border-l-4 transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
    disabled ? "cursor-default" : "cursor-pointer"
  } ${
    isSelected
      ? "border-[var(--border-accent-teal)] bg-[var(--surface-subtle)] ring-1 ring-[var(--border-accent-teal)]"
      : "border-transparent bg-[var(--surface-elevated)] ring-1 ring-transparent hover:bg-[var(--surface-subtle)] hover:ring-[var(--border-soft)]"
  }`;
};

const ucActionButtonClassName =
  "civitas-action civitas-action--ghost inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold";

const selectClassName =
  "w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[#E3E7EA] disabled:bg-[#F4F6F8] disabled:text-[#9AA5AD]";

export default function DespesaForm({
  mode,
  ucs,
  usuarios,
  initialValues,
  onCancel,
  onConfirm,
}: DespesaFormProps) {
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  const [currentAuthUser, setCurrentAuthUser] = useState(() => authStorage.get());
  const currentUserId = currentAuthUser?.id ?? null;
  const [selectedUc, setSelectedUc] = useState<DespesaUcOption | null>(null);
  const [formValues, setFormValues] = useState<DespesaFormValues>(() =>
    buildInitialFormValues(initialValues, currentUserId, mode)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedUcSummary = useMemo(
    () => ({
      instituicao: selectedUc?.instituicaoNome ?? "",
      secretaria: selectedUc?.secretariaNome ?? "",
      tipoCodigo: selectedUc?.tipoCodigoNome ?? "",
      tipoDespesa: selectedUc?.tipoDespesaNome ?? "",
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
      setFormValues((currentValues) => ({
        ...currentValues,
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

    setFormValues((currentValues) => ({
      ...currentValues,
      idUnidadeConsumidora: selectedUc.id,
      uc: selectedUc.identificador,
      idTipoCodigo: selectedUc.idTipoCodigo ?? "",
      idTipoDespesa: selectedUc.idTipoDespesa,
      idInstituicao: selectedUc.idInstituicao,
      idOrcamento: selectedUc.idOrcamento,
      idFornecedor: selectedUc.idFornecedor,
      codigo:
        currentValues.codigo && String(currentValues.codigo).trim().length > 0
          ? currentValues.codigo
          : selectedUc.identificador,
    }));
  }, [selectedUc]);

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    uc: DespesaUcOption
  ) => {
    if (isViewMode) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedUc(uc);
      setErrors((currentErrors) => ({
        ...currentErrors,
        idUnidadeConsumidora: "",
        uc: "",
        idInstituicao: "",
        idOrcamento: "",
        idFornecedor: "",
      }));
    }
  };

  const handleSelectUc = (uc: DespesaUcOption) => {
    if (isViewMode) return;

    setSelectedUc(uc);
    setErrors((currentErrors) => ({
      ...currentErrors,
      idUnidadeConsumidora: "",
      uc: "",
      idInstituicao: "",
      idOrcamento: "",
      idFornecedor: "",
    }));
  };

  const handleValueChange = <K extends keyof DespesaFormValues>(
    key: K,
    value: DespesaFormValues[K]
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));

    if (errors[key as string]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [key]: "",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("asdasda")
    if (isViewMode || !onConfirm) return;

    const nextErrors: Record<string, string> = {};
    if (!selectedUc) {
      nextErrors.idUnidadeConsumidora = ucSelectionMessage;
      nextErrors.uc = ucSelectionMessage;
    }

    const numeroDocumento = digitsOnly(formValues.numeroDocumento);
    if (!numeroDocumento) {
      nextErrors.numeroDocumento = "Numero do documento deve conter apenas numeros.";
    }

    if (String(formValues.codigo ?? "").trim().length > 100) {
      nextErrors.codigo = "Codigo deve ter no maximo 100 caracteres.";
    }

    const valorPrevistoError = validatePositiveNumber(
      formValues.valorPrevisto,
      "Valor previsto"
    );
    if (valorPrevistoError) {
      nextErrors.valorPrevisto = valorPrevistoError;
    }

    const valorPagoError = validateOptionalNonNegativeNumber(
      formValues.valorPago,
      "Valor pago"
    );
    if (valorPagoError) {
      nextErrors.valorPago = valorPagoError;
    }

    const consumoPrevistoError = validateOptionalNonNegativeNumber(
      formValues.consumoPrevisto,
      "Consumo previsto"
    );
    if (consumoPrevistoError) {
      nextErrors.consumoPrevisto = consumoPrevistoError;
    }

    const consumoRealError = validateOptionalNonNegativeNumber(
      formValues.consumoReal,
      "Consumo real"
    );
    if (consumoRealError) {
      nextErrors.consumoReal = consumoRealError;
    }

    const normalizedDataEmicao = normalizeDateInput(formValues.dataEmicao);
    if (!normalizedDataEmicao) {
      nextErrors.dataEmicao = "Data de emissao invalida.";
    }

    const normalizedDataVencimento = normalizeDateInput(formValues.dataVencimento);
    if (!normalizedDataVencimento) {
      nextErrors.dataVencimento = "Data de vencimento invalida.";
    }

    const dateRangeError = validateDespesaDateRange(
      normalizedDataEmicao,
      normalizedDataVencimento
    );
    if (dateRangeError) {
      nextErrors.dataVencimento = dateRangeError;
    }

    const resolvedResponsibleUserId =
      Number(formValues.idUsuario) ||
      currentUserId ||
      authStorage.get()?.id ||
      null;

    if (!resolvedResponsibleUserId) {
      nextErrors.idUsuario = "Selecione um usuario responsavel.";
    }

    const resolvedStatus = isCreateMode
      ? 1
      : Number(formValues.situacao);

    if (!resolvedStatus) {
      nextErrors.situacao = "Selecione um status financeiro.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const finalResponsibleUserId = Number(resolvedResponsibleUserId);

    await onConfirm({
      ...formValues,
      numeroDocumento,
      idUsuario: finalResponsibleUserId,
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
    <form className="flex max-h-[72vh] flex-col" onSubmit={handleSubmit}>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
          Formulario de despesa
        </p>
        <h3 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
          Selecione uma UC e registre o gasto
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
          Escolha a unidade consumidora ao lado. Os vinculos da despesa serao
          preenchidos automaticamente sempre que a UC for selecionada.
        </p>
      </header>

      <div className="mt-5 grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-2">
        <section className="civitas-surface rounded-sm border h-full max-h-[400px] flex flex-col p-4">
          <div className="mt-4">
            <h4 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Lista de Unidades Consumidoras disponiveis
            </h4>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Clique em uma linha para selecionar a UC.
            </p>
          </div>

          <div className="mt-4 overflow-y-auto rounded-sm border border-[var(--border-soft)] bg-[var(--surface-default)]">
            {ucs.length > 0 ? (
              <table className="min-w-full border-separate border-spacing-0 text-left text-[var(--foreground)]">
                <thead className="sticky top-0 z-10 bg-[var(--surface-subtle)] shadow-[var(--shadow-xs)]">
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Identificador</th>
                    <th className="px-4 py-3 text-right">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {ucs.map((uc) => {
                    const isSelected = selectedUc?.id === uc.id;
                    const actionTextClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground)]";
                    const selectedCellClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground)]";
                    const selectedMutedCellClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground-muted)]";

                    return (
                      <tr
                        key={uc.id}
                        tabIndex={isViewMode ? -1 : 0}
                        aria-selected={isSelected}
                        className={getUcRowClassName(isSelected, isViewMode)}
                        onClick={() => handleSelectUc(uc)}
                        onKeyDown={(event) => handleRowKeyDown(event, uc)}
                      >
                        <td className={`px-4 py-3 text-sm font-semibold ${selectedCellClassName}`}>
                          {String(uc.id).padStart(3, "0")}
                        </td>
                        <td className={`px-4 py-3 text-sm ${selectedMutedCellClassName}`}>
                          {uc.identificador}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={isViewMode}
                            className={`${ucActionButtonClassName} ${actionTextClassName}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectUc(uc);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <span className="material-symbols-outlined !text-[16px]">
                                  check
                                </span>
                                Selecionada
                              </>
                            ) : (
                              "Selecionar"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-6 text-center text-sm text-[var(--foreground-soft)]">
                Nenhuma UC disponivel no momento.
              </div>
            )}
          </div>

          {errors.idUnidadeConsumidora ? (
            <p className="mt-3 text-sm font-medium text-[#C23D3D]">
              {errors.idUnidadeConsumidora}
            </p>
          ) : null}
        </section>

        <section className="min-w-0">
          <div className="civitas-surface rounded-sm border border-[var(--border-soft)] p-4 shadow-[var(--shadow-xs)] relative">
            <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                Unidade consumidora selecionada
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1 font-semibold text-[var(--foreground)]">
                  {selectedUc ? String(selectedUc.id).padStart(3, "0") : "Sem selecao"}
                </span>
                <span className="text-[var(--foreground-muted)]">
                  {selectedUc ? selectedUc.identificador : "Selecione uma UC na lista"}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                  Vinculos preenchidos pela UC
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="UC (ID)"
                    placeholder="Selecione uma UC"
                    disabled
                    value={
                      formValues.idUnidadeConsumidora
                        ? String(formValues.idUnidadeConsumidora).padStart(3, "0")
                        : ""
                    }
                  />
                  <Input
                    label="Identificador UC"
                    placeholder="Selecione uma UC"
                    disabled
                    value={formValues.uc}
                    error={errors.uc}
                  />
                  <Input
                    label="Instituicao"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.instituicao}
                  />
                  <Input
                    label="Secretaria"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.secretaria}
                  />
                  <Input
                    label="Tipo de codigo"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.tipoCodigo}
                  />
                  <Input
                    label="Categoria"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.tipoDespesa}
                  />
                  <Input
                    label="Orcamento"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.orcamento}
                  />
                  <Input
                    label="Fornecedor"
                    placeholder="Selecione uma UC"
                    disabled
                    value={selectedUcSummary.fornecedor}
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                  Dados da despesa
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Numero do documento"
                    placeholder="Somente numeros"
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formValues.numeroDocumento}
                    error={errors.numeroDocumento}
                    onChange={(event) =>
                      handleValueChange("numeroDocumento", event.target.value)
                    }
                  />
                  <Input
                    label="Codigo"
                    placeholder="Codigo de agrupamento"
                    disabled={isViewMode}
                    value={formValues.codigo}
                    error={errors.codigo}
                    onChange={(event) => handleValueChange("codigo", event.target.value)}
                  />
                  <Input
                    label="Data de emissao"
                    type="date"
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formValues.dataEmicao}
                    error={errors.dataEmicao}
                    onChange={(event) => handleValueChange("dataEmicao", event.target.value)}
                  />
                  <Input
                    label="Data de vencimento"
                    type="date"
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formValues.dataVencimento}
                    error={errors.dataVencimento}
                    onChange={(event) =>
                      handleValueChange("dataVencimento", event.target.value)
                    }
                  />
                  <Input
                    label="Valor previsto"
                    placeholder="0,00"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formValues.valorPrevisto}
                    error={errors.valorPrevisto}
                    onChange={(event) =>
                      handleValueChange(
                        "valorPrevisto",
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                  />
                  <Input
                    label="Consumo previsto"
                    placeholder="0"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formValues.consumoPrevisto}
                    error={errors.consumoPrevisto}
                    onChange={(event) =>
                      handleValueChange(
                        "consumoPrevisto",
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                  />
                  {isCreateMode ? (
                    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 md:col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                        Definicoes automaticas do cadastro
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-[var(--foreground-muted)]">
                        <p>
                          Status inicial:{" "}
                          <span className="font-semibold text-[var(--foreground)]">
                            A pagar
                          </span>
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
                        onChange={(event) =>
                          handleValueChange(
                            "valorPago",
                            event.target.value === "" ? "" : Number(event.target.value)
                          )
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
                        onChange={(event) =>
                          handleValueChange(
                            "consumoReal",
                            event.target.value === "" ? "" : Number(event.target.value)
                          )
                        }
                      />

                      <div className="w-full">
                        <label className="mb-2 block text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]">
                          Usuario responsavel
                          {!isViewMode ? <span className="ml-1 text-red-500">*</span> : null}
                        </label>
                        <select
                          value={formValues.idUsuario}
                          disabled={isViewMode}
                          required={!isViewMode}
                          className={selectClassName}
                          onChange={(event) =>
                            handleValueChange(
                              "idUsuario",
                              event.target.value === "" ? "" : Number(event.target.value)
                            )
                          }
                        >
                          <option value="">Selecione o usuario</option>
                          {usuarios.map((usuario) => (
                            <option key={usuario.value} value={usuario.value}>
                              {usuario.label}
                            </option>
                          ))}
                        </select>
                        {errors.idUsuario ? (
                          <p className="mt-1.5 text-sm font-medium text-[#C23D3D]">
                            {errors.idUsuario}
                          </p>
                        ) : null}
                      </div>

                      <div className="w-full">
                        <label className="mb-2 block text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]">
                          Status financeiro
                          {!isViewMode ? <span className="ml-1 text-red-500">*</span> : null}
                        </label>
                        <select
                          value={formValues.situacao}
                          disabled={isViewMode}
                          required={!isViewMode}
                          className={selectClassName}
                          onChange={(event) =>
                            handleValueChange(
                              "situacao",
                              event.target.value === "" ? "" : Number(event.target.value)
                            )
                          }
                        >
                          <option value="">Selecione o status</option>
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        {errors.situacao ? (
                          <p className="mt-1.5 text-sm font-medium text-[#C23D3D]">
                            {errors.situacao}
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--divider)] pt-5 md:flex-row">
              <Button
                variant="secondary"
                className="!w-full !max-w-none"
                onClick={onCancel}
                type="button"
              >
                {isViewMode ? "Fechar" : "Cancelar"}
              </Button>

              {isViewMode ? null : (
                <Button className="!w-full !max-w-none" type="submit">
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
