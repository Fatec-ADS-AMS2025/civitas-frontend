import { digitsOnly } from "@/global/formPayload";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import { toPositiveNumber } from "./despesas.utils";

export const DESPESA_FORM_SECTIONS = {
  identificacao: "Identificacao",
  classificacao: "Classificacao",
  valoresDatas: "Valores e datas",
  vinculos: "Vinculos",
  status: "Status",
} as const;

export const validateNumeroDocumento = (value: unknown): string | undefined => {
  const rawValue = value === undefined || value === null ? "" : String(value).trim();
  const normalizedValue = digitsOnly(rawValue);

  if (!rawValue) return "Numero do documento e obrigatorio.";
  if (!normalizedValue || normalizedValue !== rawValue) {
    return "Numero do documento deve conter apenas numeros.";
  }
  if (normalizedValue.length > 100) {
    return "Numero do documento deve ter no maximo 100 caracteres.";
  }
  return undefined;
};

export const validatePositiveSelect = (
  value: unknown,
  message: string
): string | undefined => {
  return toPositiveNumber(value) <= 0 ? message : undefined;
};

const matchesOptionalRelation = (expected: number, actual: unknown): boolean => {
  const selected = toPositiveNumber(actual);
  return selected <= 0 || expected <= 0 || selected === expected;
};

export const validateUnidadeConsumidora = (
  value: unknown,
  formData: Record<string, unknown>,
  unidadesConsumidoras: UnidadeConsumidoraDTO[],
  requiresUc: boolean
): string | undefined => {
  const selectedId = toPositiveNumber(value);

  if (selectedId <= 0) {
    return requiresUc ? "Selecione uma unidade consumidora valida." : undefined;
  }

  const unidadeConsumidora = unidadesConsumidoras.find((item) => item.id === selectedId);
  if (!unidadeConsumidora) {
    return "Selecione uma unidade consumidora valida.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idTipoDespesa, formData.idTipoDespesa)) {
    return "Unidade consumidora incompativel com a categoria selecionada.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idInstituicao, formData.idInstituicao)) {
    return "Unidade consumidora incompativel com a instituicao selecionada.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idOrcamento, formData.idOrcamento)) {
    return "Unidade consumidora incompativel com o orcamento selecionado.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idFornecedor, formData.idFornecedor)) {
    return "Unidade consumidora incompativel com o fornecedor selecionado.";
  }

  return undefined;
};
