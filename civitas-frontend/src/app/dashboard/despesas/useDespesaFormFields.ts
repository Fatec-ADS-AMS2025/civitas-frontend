"use client";

import { useCallback, useMemo } from "react";
import type { DocumentoFieldValue } from "@/components/Form/documento-field";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import {
  digitsOnly,
  normalizeDateInput,
  validateDespesaDateRange,
  validateRequiredUc,
} from "@/global/formPayload";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import { STATUS_OPTIONS } from "./despesas.constants";
import type { SelectOption } from "./despesas.types";
import { toPositiveNumber } from "./despesas.utils";

type UseDespesaFormFieldsInput = {
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  resolvedTipoCodigoOptions: SelectOption[];
  resolvedTipoDespesaOptions: SelectOption[];
  resolvedInstituicaoOptions: SelectOption[];
  resolvedOrcamentoOptions: SelectOption[];
  resolvedFornecedorOptions: SelectOption[];
  resolvedUsuarioOptions: SelectOption[];
  resolvedFluxoOptions: SelectOption[];
  isOptionsLoading?: boolean;
  hideDocumento?: boolean;
};

export function useDespesaFormFields({
  tipoCodigos,
  tiposDespesa,
  resolvedTipoCodigoOptions,
  resolvedTipoDespesaOptions,
  resolvedInstituicaoOptions,
  resolvedOrcamentoOptions,
  resolvedFornecedorOptions,
  resolvedUsuarioOptions,
  resolvedFluxoOptions,
  isOptionsLoading = false,
  hideDocumento = false,
}: UseDespesaFormFieldsInput): ModalFieldConfig[] {
  const isDocumentoValue = useCallback(
    (value: unknown): value is DocumentoFieldValue => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }

      const documento = value as Partial<DocumentoFieldValue>;
      return typeof documento.digitalizacao === "string" && documento.digitalizacao.trim().length > 0;
    },
    []
  );

  const resolveTipoDespesa = useCallback(
    (value: unknown) => {
      const tipoDespesaId = Number(value);
      return tiposDespesa.find((tipoDespesa) => tipoDespesa.id === tipoDespesaId);
    },
    [tiposDespesa]
  );

  const resolveTipoCodigo = useCallback(
    (value: unknown) => {
      const tipoCodigoId = Number(value);
      return tipoCodigos.find((tipoCodigo) => tipoCodigo.id === tipoCodigoId);
    },
    [tipoCodigos]
  );

  const resolveDocumento = useCallback(
    (value: unknown) => (isDocumentoValue(value) ? value : undefined),
    [isDocumentoValue]
  );

  return useMemo<ModalFieldConfig[]>(
    () => [
      {
        key: "id",
        label: "Registro",
        placeholder: "Registro da despesa",
        type: "number",
        section: "Identificacao",
      },
      {
        key: "documento",
        label: "Documento",
        placeholder: "Selecione um arquivo",
        type: "documento",
        hidden: hideDocumento,
        requiredInModes: ["create"],
        accept: ".pdf,.png,.jpg,.jpeg,image/*,application/pdf",
        validate: (value, formData, mode) => {
          const documento = resolveDocumento(value);
          const hasDocumentInput = value !== "" && value !== undefined && value !== null;

          if (mode !== "create" && !hasDocumentInput) {
            return undefined;
          }

          if (!documento) {
            return "Selecione um arquivo e aguarde a conversao para Base64.";
          }

          if (!digitsOnly(formData.numeroDocumento)) {
            return "Informe o numero do documento antes de enviar.";
          }

          if (toPositiveNumber(formData.idFornecedor) <= 0) {
            return "Selecione um fornecedor valido para vincular o documento.";
          }

          if (toPositiveNumber(formData.idFluxo) <= 0) {
            return "Selecione um fluxo valido para vincular o documento.";
          }

          return undefined;
        },
      },
      {
        key: "numeroDocumento",
        label: "Numero do documento",
        placeholder: "Somente numeros",
        mask: "integer",
        required: true,
        section: "Identificacao",
        validate: (value) => {
          const normalizedValue = digitsOnly(value);
          if (!normalizedValue) return "Numero do documento deve conter apenas numeros.";
          if (normalizedValue.length > 100) {
            return "Numero do documento deve ter no maximo 100 caracteres.";
          }
          return undefined;
        },
      },
      {
        key: "idFluxo",
        label: "Fluxo",
        placeholder: "Selecione o fluxo",
        type: "select",
        requiredInModes: ["create"],
        disabled: isOptionsLoading,
        options: resolvedFluxoOptions,
        validate: (value, formData, mode) => {
          const hasDocumentInput =
            formData.documento !== "" &&
            formData.documento !== undefined &&
            formData.documento !== null;

          if ((mode === "create" || hasDocumentInput) && toPositiveNumber(value) <= 0) {
            return "Selecione um fluxo valido.";
          }

          return undefined;
        },
      },
      {
        key: "codigo",
        label: "Codigo de agrupamento",
        placeholder: "Ex.: 1001",
        mask: "integer",
        section: "Identificacao",
      },
      {
        key: "idTipoCodigo",
        label: "Tipo de codigo",
        placeholder: "Selecione um tipo de codigo",
        type: "select",
        required: true,
        section: "Identificacao",
        options: resolvedTipoCodigoOptions,
        validate: (value, formData) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um tipo de codigo valido.";
          }

          const tipoDespesa = resolveTipoDespesa(formData.idTipoDespesa);
          if (tipoDespesa && tipoDespesa.idTipoCodigo !== toPositiveNumber(value)) {
            return "Selecione um tipo de codigo compativel com a categoria.";
          }

          return undefined;
        },
      },
      {
        key: "idTipoDespesa",
        label: "Categoria",
        placeholder: "Selecione um tipo de despesa",
        type: "select",
        required: true,
        section: "Identificacao",
        options: resolvedTipoDespesaOptions,
        validate: (value, formData) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um tipo de despesa valido.";
          }

          const tipoDespesa = resolveTipoDespesa(value);
          const tipoCodigoSelecionado = resolveTipoCodigo(formData.idTipoCodigo);

          if (
            tipoDespesa &&
            tipoCodigoSelecionado &&
            tipoDespesa.idTipoCodigo !== tipoCodigoSelecionado.id
          ) {
            return "Selecione uma categoria compativel com o tipo de codigo informado.";
          }

          return undefined;
        },
      },
      {
        key: "uc",
        label: "UC",
        placeholder: "Informe a unidade consumidora",
        section: "Vinculos",
        validate: (value, formData) => {
          const tipoDespesa = resolveTipoDespesa(formData.idTipoDespesa);
          return validateRequiredUc(value, tipoDespesa?.solicitaUc === 1);
        },
      },
      {
        key: "idUnidadeConsumidora",
        label: "ID da unidade consumidora",
        placeholder: "ID da UC vinculada",
        type: "number",
        section: "Vinculos",
      },
      {
        key: "valorPrevisto",
        label: "Valor previsto",
        placeholder: "0,00",
        type: "number",
        mask: "currency",
        required: true,
        section: "Financeiro",
        validate: (value) => {
          const numericValue = Number(value);
          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Valor previsto nao pode ser negativo.";
          }
          return undefined;
        },
      },
      {
        key: "valorPago",
        label: "Valor pago",
        placeholder: "0,00",
        type: "number",
        mask: "currency",
        section: "Financeiro",
        validate: (value) => {
          const numericValue = Number(value);
          if (value === "" || value === undefined || value === null) {
            return undefined;
          }

          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Valor pago nao pode ser negativo.";
          }
          return undefined;
        },
      },
      {
        key: "consumoPrevisto",
        label: "Consumo previsto",
        placeholder: "0",
        type: "number",
        required: true,
        section: "Financeiro",
        validate: (value) => {
          const numericValue = Number(value);
          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Consumo previsto nao pode ser negativo.";
          }
          return undefined;
        },
      },
      {
        key: "consumoReal",
        label: "Consumo real",
        placeholder: "0",
        type: "number",
        section: "Financeiro",
        validate: (value) => {
          const numericValue = Number(value);
          if (value === "" || value === undefined || value === null) {
            return undefined;
          }

          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Consumo real nao pode ser negativo.";
          }
          return undefined;
        },
      },
      {
        key: "dataEmicao",
        label: "Data de emissao",
        type: "date",
        required: true,
        section: "Financeiro",
        validate: (value, formData) => {
          const normalizedDate = normalizeDateInput(value);
          if (!normalizedDate) return "Data de emissao invalida.";
          return validateDespesaDateRange(normalizedDate, formData.dataVencimento);
        },
      },
      {
        key: "dataVencimento",
        label: "Data de vencimento",
        type: "date",
        required: true,
        section: "Financeiro",
        validate: (value, formData) => {
          const normalizedDate = normalizeDateInput(value);
          if (!normalizedDate) return "Data de vencimento invalida.";
          return validateDespesaDateRange(formData.dataEmicao, normalizedDate);
        },
      },
      {
        key: "idInstituicao",
        label: "Instituicao",
        placeholder: "Selecione a instituicao",
        type: "select",
        required: true,
        section: "Relacionamentos",
        options: resolvedInstituicaoOptions,
        validate: (value) =>
          toPositiveNumber(value) <= 0 ? "Selecione uma instituicao valida." : undefined,
      },
      {
        key: "idOrcamento",
        label: "Orcamento",
        placeholder: "Selecione o orcamento",
        type: "select",
        required: true,
        section: "Relacionamentos",
        options: resolvedOrcamentoOptions,
        validate: (value) =>
          toPositiveNumber(value) <= 0 ? "Selecione um orcamento valido." : undefined,
      },
      {
        key: "idFornecedor",
        label: "Fornecedor",
        placeholder: "Selecione o fornecedor",
        type: "select",
        required: true,
        section: "Relacionamentos",
        options: resolvedFornecedorOptions,
        validate: (value) =>
          toPositiveNumber(value) <= 0 ? "Selecione um fornecedor valido." : undefined,
      },
      {
        key: "idUsuario",
        label: "Usuario responsavel",
        placeholder: "Selecione o usuario",
        type: "select",
        required: true,
        section: "Relacionamentos",
        options: resolvedUsuarioOptions,
        validate: (value) =>
          toPositiveNumber(value) <= 0 ? "Selecione um usuario valido." : undefined,
      },
      {
        key: "situacao",
        label: "Status financeiro",
        placeholder: "Selecione o status",
        type: "select",
        required: true,
        section: "Status",
        options: STATUS_OPTIONS,
      },
    ],
    [
      resolvedFornecedorOptions,
      resolvedInstituicaoOptions,
      resolvedFluxoOptions,
      resolvedOrcamentoOptions,
      resolvedTipoCodigoOptions,
      resolvedTipoDespesaOptions,
      resolvedUsuarioOptions,
      isOptionsLoading,
      resolveDocumento,
      resolveTipoCodigo,
      resolveTipoDespesa,
    ]
  );
}
