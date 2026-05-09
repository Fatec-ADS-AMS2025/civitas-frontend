import {
  digitsOnly,
  normalizeDespesaPayload,
  validateDespesaDateRange,
} from "@/global/formPayload";
import { SITUACAO_ATIVO } from "@/global/situacao";
import type DespesaDTO from "@/models/despesa";
import { normalizeValidDateInput } from "./dates";
import { SOLICITA_UC_SIM, type DashboardData } from "./types";

const toPositiveId = (value: unknown): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const matchesOptionalRelation = (expected: number, actual: unknown): boolean => {
  const selected = toPositiveId(actual);
  return selected <= 0 || expected <= 0 || selected === expected;
};

const validateNumeroDocumento = (value: unknown): string | undefined => {
  const rawValue = value === undefined || value === null ? "" : String(value).trim();
  const normalizedValue = digitsOnly(rawValue);

  if (!rawValue) {
    return "Numero do documento e obrigatorio.";
  }

  if (!normalizedValue || normalizedValue !== rawValue) {
    return "Numero do documento deve conter apenas numeros.";
  }

  if (normalizedValue.length > 100) {
    return "Numero do documento deve ter no maximo 100 caracteres.";
  }

  return undefined;
};

const validateLookupRelationship = (
  payload: DespesaDTO,
  data: DashboardData,
  selectedTipoCodigoId: number
): string | undefined => {
  const tipoDespesa = data.tiposDespesa.find((item) => item.id === payload.idTipoDespesa);
  if (!tipoDespesa) {
    return "Selecione uma categoria valida.";
  }

  if (tipoDespesa.idTipoCodigo !== selectedTipoCodigoId) {
    return "Selecione uma categoria compativel com o tipo de codigo informado.";
  }

  const orcamento = data.orcamentos.find((item) => item.idOrcamento === payload.idOrcamento);
  if (!orcamento) {
    return "Selecione um orcamento valido.";
  }

  const instituicao = data.instituicoes.find((item) => item.id === payload.idInstituicao);
  if (!instituicao) {
    return "Selecione uma instituicao valida.";
  }

  const fornecedor = data.fornecedores.find((item) => item.idFornecedor === payload.idFornecedor);
  if (!fornecedor) {
    return "Selecione um fornecedor valido.";
  }

  const usuario = data.usuarios.find((item) => item.id === payload.idUsuario);
  if (!usuario) {
    return "Selecione um usuario valido.";
  }

  if ((orcamento.idInstituicao ?? 0) !== payload.idInstituicao) {
    return "O orcamento informado nao pertence a instituicao selecionada.";
  }

  if (
    orcamento.idTipoDespesa &&
    orcamento.idTipoDespesa > 0 &&
    orcamento.idTipoDespesa !== payload.idTipoDespesa
  ) {
    return "O orcamento informado nao esta vinculado ao tipo de despesa selecionado.";
  }

  const unidadeConsumidoraId = toPositiveId(payload.idUnidadeConsumidora);
  if (tipoDespesa.solicitaUc === SOLICITA_UC_SIM && unidadeConsumidoraId <= 0) {
    return "Selecione uma unidade consumidora valida.";
  }

  if (unidadeConsumidoraId <= 0) return undefined;

  const unidadeConsumidora = data.unidadesConsumidoras.find(
    (item) => item.id === unidadeConsumidoraId
  );
  if (!unidadeConsumidora) {
    return "Selecione uma unidade consumidora valida.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idTipoDespesa, payload.idTipoDespesa)) {
    return "Unidade consumidora incompativel com a categoria selecionada.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idInstituicao, payload.idInstituicao)) {
    return "Unidade consumidora incompativel com a instituicao selecionada.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idOrcamento, payload.idOrcamento)) {
    return "Unidade consumidora incompativel com o orcamento selecionado.";
  }

  if (!matchesOptionalRelation(unidadeConsumidora.idFornecedor, payload.idFornecedor)) {
    return "Unidade consumidora incompativel com o fornecedor selecionado.";
  }

  return undefined;
};

export const buildDespesaPayload = (
  formData: Record<string, unknown>,
  data: DashboardData,
  currentDespesa?: DespesaDTO
): DespesaDTO => {
  const numeroDocumento = formData.numeroDocumento ?? currentDespesa?.numeroDocumento ?? "";
  const numeroDocumentoError = validateNumeroDocumento(numeroDocumento);
  if (numeroDocumentoError) throw new Error(numeroDocumentoError);

  const dataEmissao = normalizeValidDateInput(
    formData.dataEmissao ??
      formData.dataEmicao ??
      currentDespesa?.dataEmissao ??
      currentDespesa?.dataEmicao
  );
  if (!dataEmissao) throw new Error("Data de emissao invalida.");

  const dataVencimento = normalizeValidDateInput(
    formData.dataVencimento ?? currentDespesa?.dataVencimento ?? currentDespesa?.data
  );
  if (!dataVencimento) throw new Error("Data de vencimento invalida.");

  const dateRangeError = validateDespesaDateRange(dataEmissao, dataVencimento);
  if (dateRangeError) throw new Error(dateRangeError);

  const selectedTipoCodigoId = toPositiveId(formData.idTipoCodigo);
  if (selectedTipoCodigoId <= 0) {
    throw new Error("Selecione um tipo de codigo valido.");
  }

  const normalizedPayload = normalizeDespesaPayload({
    id: Number(formData.id ?? currentDespesa?.id ?? 0),
    numeroDocumento,
    codigo: formData.codigo ?? currentDespesa?.codigo ?? "",
    uc: formData.uc ?? currentDespesa?.uc ?? "",
    idUnidadeConsumidora:
      formData.idUnidadeConsumidora ?? currentDespesa?.idUnidadeConsumidora ?? 0,
    dataEmissao,
    dataEmicao: dataEmissao,
    consumoPrevisto:
      formData.consumoPrevisto ??
      formData.valor ??
      currentDespesa?.consumoPrevisto ??
      currentDespesa?.valor ??
      0,
    dataVencimento,
    status: formData.status ?? formData.situacao ?? currentDespesa?.status,
    situacao: formData.situacao ?? currentDespesa?.situacao,
    idTipoDespesa: formData.idTipoDespesa ?? currentDespesa?.idTipoDespesa,
    idOrcamento: formData.idOrcamento ?? currentDespesa?.idOrcamento,
    idInstituicao: formData.idInstituicao ?? currentDespesa?.idInstituicao,
    idFornecedor:
      formData.idFornecedor ?? currentDespesa?.idFornecedor ?? currentDespesa?.fornecedorId,
    idUsuario: formData.idUsuario ?? currentDespesa?.idUsuario,
  }) as DespesaDTO;

  const consumoPrevisto = Number(normalizedPayload.consumoPrevisto ?? 0);
  if (Number.isNaN(consumoPrevisto) || consumoPrevisto < 0) {
    throw new Error("Valor da despesa nao pode ser negativo.");
  }

  const situacao = toPositiveId(normalizedPayload.status ?? normalizedPayload.situacao);
  if (situacao <= 0) {
    throw new Error("Selecione um status financeiro valido.");
  }

  const lookupError = validateLookupRelationship(normalizedPayload, data, selectedTipoCodigoId);
  if (lookupError) throw new Error(lookupError);

  return {
    ...normalizedPayload,
    id: currentDespesa?.id ?? Number(normalizedPayload.id ?? 0),
    consumoPrevisto,
    status: situacao,
    situacao: situacao || SITUACAO_ATIVO,
    idTipoDespesa: Number(normalizedPayload.idTipoDespesa),
    idOrcamento: Number(normalizedPayload.idOrcamento),
    idInstituicao: Number(normalizedPayload.idInstituicao),
    idFornecedor: Number(normalizedPayload.idFornecedor),
    idUsuario: Number(normalizedPayload.idUsuario),
    idUnidadeConsumidora: Number(normalizedPayload.idUnidadeConsumidora ?? 0),
  };
};
