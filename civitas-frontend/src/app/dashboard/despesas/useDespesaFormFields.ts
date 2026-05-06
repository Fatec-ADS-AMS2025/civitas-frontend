"use client";

import { useCallback, useMemo } from "react";
import type {
  DocumentoFieldOption,
  DocumentoFieldValue,
} from "@/components/Form/documento-field";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import {
  digitsOnly,
  normalizeDateInput,
  validateDespesaDateRange,
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
  resolvedDocumentoOptions: DocumentoFieldOption[];
  resolvedUnidadeConsumidoraOptions: SelectOption[];
  isOptionsLoading?: boolean;
  optionsError?: string | null;
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
  resolvedDocumentoOptions,
  resolvedUnidadeConsumidoraOptions,
  isOptionsLoading = false,
  optionsError,
}: UseDespesaFormFieldsInput): ModalFieldConfig[] {
  const isDocumentoValue = useCallback(
    (value: unknown): value is DocumentoFieldValue => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }

      const documento = value as Partial<DocumentoFieldValue>;
      return Number(documento.idDocumento) > 0;
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
    (value: unknown) => {
      if (isDocumentoValue(value)) return value;
      const documentoId = Number(value);
      return resolvedDocumentoOptions.find((option) => option.value === documentoId)?.documento;
    },
    [isDocumentoValue, resolvedDocumentoOptions]
  );

  return useMemo<ModalFieldConfig[]>(
    () => [
      { key: "id", hidden: true },
      {
        key: "documento",
        label: "Documento",
        placeholder: "Selecione um documento",
        type: "documento",
        required: true,
        documentOptions: resolvedDocumentoOptions,
        documentLoading: isOptionsLoading,
        documentError: optionsError ?? undefined,
        validate: (value, formData) => {
          const documento = resolveDocumento(value);
          if (!documento) return "Selecione um documento valido.";

          if (
            digitsOnly(documento.numeroDocumento) !==
            digitsOnly(formData.numeroDocumento)
          ) {
            return "Documento selecionado nao corresponde ao numero informado.";
          }

          const idFornecedor = toPositiveNumber(formData.idFornecedor);
          if (idFornecedor > 0 && documento.idFornecedor !== idFornecedor) {
            return "Documento selecionado nao corresponde ao fornecedor informado.";
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
        key: "codigo",
        label: "Codigo de agrupamento",
        placeholder: "Ex.: 1001",
        mask: "integer",
      },
      {
        key: "idTipoCodigo",
        label: "Tipo de codigo",
        placeholder: "Selecione um tipo de codigo",
        type: "select",
        required: true,
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
        key: "idUnidadeConsumidora",
        label: "Unidade consumidora",
        placeholder: "Selecione a unidade consumidora",
        type: "select",
        required: true,
        options: resolvedUnidadeConsumidoraOptions,
        validate: (value) =>
          toPositiveNumber(value) <= 0
            ? "Selecione uma unidade consumidora valida."
            : undefined,
      },
      {
        key: "consumoPrevisto",
        label: "Valor",
        placeholder: "0,00",
        type: "number",
        mask: "currency",
        required: true,
        validate: (value) => {
          const numericValue = Number(value);
          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Valor da despesa nao pode ser negativo.";
          }
          return undefined;
        },
      },
      {
        key: "dataEmicao",
        label: "Data de emissao",
        type: "date",
        required: true,
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
        options: STATUS_OPTIONS,
      },
    ],
    [
      resolvedFornecedorOptions,
      resolvedInstituicaoOptions,
      resolvedDocumentoOptions,
      resolvedOrcamentoOptions,
      resolvedTipoCodigoOptions,
      resolvedTipoDespesaOptions,
      resolvedUsuarioOptions,
      resolvedUnidadeConsumidoraOptions,
      isOptionsLoading,
      optionsError,
      resolveDocumento,
      resolveTipoCodigo,
      resolveTipoDespesa,
    ]
  );
}
