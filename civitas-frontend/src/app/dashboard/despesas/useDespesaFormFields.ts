"use client";

import { useCallback, useMemo } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { validateDespesaDateRange } from "@/global/formPayload";
import { normalizeValidDateInput } from "@/hooks/despesasDashboard/dates";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import {
  DESPESA_FORM_SECTIONS,
  validateNumeroDocumento,
  validatePositiveSelect,
  validateUnidadeConsumidora,
} from "./despesaFormFields.helpers";
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
  resolvedUnidadeConsumidoraOptions: SelectOption[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
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
  resolvedUnidadeConsumidoraOptions,
  unidadesConsumidoras,
}: UseDespesaFormFieldsInput): ModalFieldConfig[] {
  const sections = DESPESA_FORM_SECTIONS;
  const resolveTipoDespesa = useCallback(
    (value: unknown) => tiposDespesa.find((tipoDespesa) => tipoDespesa.id === Number(value)),
    [tiposDespesa]
  );

  const resolveTipoCodigo = useCallback(
    (value: unknown) => tipoCodigos.find((tipoCodigo) => tipoCodigo.id === Number(value)),
    [tipoCodigos]
  );

  return useMemo<ModalFieldConfig[]>(
    () => [
      { key: "id", hidden: true },
      {
        key: "numeroDocumento",
        label: "Numero do documento",
        placeholder: "Somente numeros",
        mask: "integer",
        required: true,
        section: sections.identificacao,
        validate: validateNumeroDocumento,
      },
      {
        key: "codigo",
        label: "Codigo",
        placeholder: "Codigo de agrupamento",
        mask: "integer",
        section: sections.identificacao,
      },
      {
        key: "idTipoCodigo",
        label: "Tipo de codigo",
        placeholder: "Selecione o tipo de codigo",
        type: "select",
        required: true,
        options: resolvedTipoCodigoOptions,
        section: sections.classificacao,
        validate: (value, formData) => {
          const requiredError = validatePositiveSelect(
            value,
            "Selecione um tipo de codigo valido."
          );
          if (requiredError) return requiredError;

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
        placeholder: "Selecione a categoria",
        type: "select",
        required: true,
        options: resolvedTipoDespesaOptions,
        section: sections.classificacao,
        validate: (value, formData) => {
          const requiredError = validatePositiveSelect(value, "Selecione uma categoria valida.");
          if (requiredError) return requiredError;

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
        key: "consumoPrevisto",
        label: "Valor da despesa",
        placeholder: "0,00",
        type: "number",
        mask: "currency",
        required: true,
        section: sections.valoresDatas,
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
        section: sections.valoresDatas,
        validate: (value, formData) => {
          const normalizedDate = normalizeValidDateInput(value);
          if (!normalizedDate) return "Data de emissao invalida.";
          return validateDespesaDateRange(normalizedDate, formData.dataVencimento);
        },
      },
      {
        key: "dataVencimento",
        label: "Data de vencimento",
        type: "date",
        required: true,
        section: sections.valoresDatas,
        validate: (value, formData) => {
          const normalizedDate = normalizeValidDateInput(value);
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
        section: sections.vinculos,
        validate: (value) => validatePositiveSelect(value, "Selecione uma instituicao valida."),
      },
      {
        key: "idOrcamento",
        label: "Orcamento",
        placeholder: "Selecione o orcamento",
        type: "select",
        required: true,
        options: resolvedOrcamentoOptions,
        section: sections.vinculos,
        validate: (value) => validatePositiveSelect(value, "Selecione um orcamento valido."),
      },
      {
        key: "idFornecedor",
        label: "Fornecedor",
        placeholder: "Selecione o fornecedor",
        type: "select",
        required: true,
        options: resolvedFornecedorOptions,
        section: sections.vinculos,
        validate: (value) => validatePositiveSelect(value, "Selecione um fornecedor valido."),
      },
      {
        key: "idUnidadeConsumidora",
        label: "Unidade consumidora",
        placeholder: "Selecione a unidade consumidora",
        type: "select",
        options: resolvedUnidadeConsumidoraOptions,
        section: sections.vinculos,
        validate: (value, formData) => {
          const tipoDespesa = resolveTipoDespesa(formData.idTipoDespesa);
          return validateUnidadeConsumidora(
            value,
            formData,
            unidadesConsumidoras,
            tipoDespesa?.solicitaUc === 1
          );
        },
      },
      {
        key: "idUsuario",
        label: "Usuario responsavel",
        placeholder: "Selecione o usuario responsavel",
        type: "select",
        required: true,
        options: resolvedUsuarioOptions,
        section: sections.vinculos,
        validate: (value) => validatePositiveSelect(value, "Selecione um usuario valido."),
      },
      {
        key: "situacao",
        label: "Status financeiro",
        placeholder: "Selecione o status financeiro",
        type: "select",
        required: true,
        options: STATUS_OPTIONS,
        section: sections.status,
        validate: (value) => validatePositiveSelect(value, "Selecione um status financeiro valido."),
      },
    ],
    [
      resolvedFornecedorOptions,
      resolvedInstituicaoOptions,
      resolvedOrcamentoOptions,
      resolvedTipoCodigoOptions,
      resolvedTipoDespesaOptions,
      resolvedUnidadeConsumidoraOptions,
      resolvedUsuarioOptions,
      resolveTipoCodigo,
      resolveTipoDespesa,
      sections,
      unidadesConsumidoras,
    ]
  );
}
