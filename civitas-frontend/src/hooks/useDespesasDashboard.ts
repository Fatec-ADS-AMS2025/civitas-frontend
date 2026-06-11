"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { digitsOnly, normalizeDateInput, toTrimmedText } from "@/global/formPayload";
import { filterActiveRecords } from "@/global/softDelete";
import { SITUACAO_ATIVO } from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { documentoService, normalizeDocumentoForUi } from "@/hooks/documento";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";
import { usuarioService } from "@/hooks/usuario";
import { authStorage } from "@/lib/auth-storage";
import type DespesaDTO from "@/models/despesa";
import type DocumentoDTO from "@/models/documento";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import type UnidadeMedidaDTO from "@/models/unidadeMedida";
import type UsuarioDTO from "@/models/usuario";

const SOLICITA_UC_SIM = 1;

export type DespesasDashboardFilters = {
  search: string;
  dataInicio: string;
  dataFim: string;
  idInstituicao: string;
  idSecretaria: string;
  idTipoCodigo: string;
  idTipoDespesa: string;
  vencimento: string;
  solicitaUc: string;
};

export type DespesaDashboardSummary = {
  saldoTotal: number;
  entrada: number;
  saida: number;
};

export type DespesaDashboardRow = {
  id: number;
  registro: string;
  categoria: string;
  tipoCodigoId: number | null;
  tipoCodigoNome: string;
  instituicaoId: number | null;
  instituicaoNome: string;
  secretariaId: number | null;
  secretariaNome: string;
  descricao: string;
  valor: number;
  valorFormatado: string;
  data: string;
  dataFormatada: string;
  situacao: number;
  situacaoLabel: string;
  solicitaUc: boolean;
  solicitaUcLabel: string;
  numeroDocumento: string;
  documento: DocumentoDTO | null;
  documentoConfiavel: boolean;
  idDocumento?: number;
  raw: DespesaDTO;
};

export type DashboardData = {
  despesas: DespesaDTO[];
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  secretarias: SecretariaDTO[];
  fornecedores: FornecedorDTO[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
  unidadesMedida: UnidadeMedidaDTO[];
  usuarios: UsuarioDTO[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  despesas: [],
  tipoCodigos: [],
  tiposDespesa: [],
  orcamentos: [],
  instituicoes: [],
  secretarias: [],
  fornecedores: [],
  unidadesConsumidoras: [],
  unidadesMedida: [],
  usuarios: [],
};

const DEFAULT_FILTERS: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idInstituicao: "",
  idSecretaria: "",
  idTipoCodigo: "",
  idTipoDespesa: "",
  vencimento: "",
  solicitaUc: "",
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (value?: string): string => {
  const timestamp = parseDateTimestamp(value);

  if (Number.isNaN(timestamp)) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
};

const normalizeText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const parseDateTimestamp = (value?: string): number => {
  const normalizedDate = normalizeDateInput(value);
  if (!normalizedDate) return Number.NaN;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
};

const ensureValidDate = (value?: string): string => {
  return normalizeDateInput(value) ?? "";
};

const resolveDespesaDate = (despesa: DespesaDTO): string => {
  return (
    normalizeDateInput(despesa.dataVencimento) ??
    normalizeDateInput(despesa.dataEmissao) ??
    normalizeDateInput(despesa.dataEmicao) ??
    normalizeDateInput(despesa.data) ??
    ""
  );
};

const resolveDespesaDescricao = (despesa: DespesaDTO): string => {
  return (
    despesa.descricao?.trim() ??
    despesa.uc?.trim() ??
    despesa.numeroDocumento?.trim() ??
    `Despesa ${despesa.id}`
  );
};

const resolveDespesaValor = (despesa: DespesaDTO): number => {
  return Number(despesa.valorPrevisto ?? despesa.valor ?? despesa.consumoPrevisto ?? 0);
};

const resolveDespesaStatus = (despesa: DespesaDTO): number => {
  const normalizedStatus = Number(despesa.status ?? despesa.situacao ?? SITUACAO_ATIVO);
  return Number.isFinite(normalizedStatus) ? normalizedStatus : SITUACAO_ATIVO;
};

const resolveDespesaStatusLabel = (status: number): string => {
  if (status === 1) return "A pagar";
  if (status === 2) return "Paga";
  if (status === 3) return "Atrasada";
  return "Nao informado";
};

const resolveOrcamentoDate = (orcamento: OrcamentoDTO): string => {
  if (orcamento.anoOrcamento) {
    return `${orcamento.anoOrcamento}-01-01`;
  }

  if (orcamento.ano) {
    return `${orcamento.ano}-01-01`;
  }

  return "";
};

const resolveOrcamentoValor = (orcamento: OrcamentoDTO): number => {
  return Number(orcamento.valorOrcamento ?? orcamento.valor ?? 0);
};

const matchesDateRange = (
  value: string,
  dataInicio: string,
  dataFim: string
): boolean => {
  const itemTimestamp = parseDateTimestamp(value);
  const startTimestamp = parseDateTimestamp(dataInicio);
  const endTimestamp = parseDateTimestamp(dataFim);

  if (Number.isNaN(itemTimestamp)) {
    return false;
  }

  if (!Number.isNaN(startTimestamp) && itemTimestamp < startTimestamp) {
    return false;
  }

  if (!Number.isNaN(endTimestamp) && itemTimestamp > endTimestamp) {
    return false;
  }

  return true;
};

const getTodayTimestamp = (): number => {
  const today = normalizeDateInput(new Date().toISOString()) ?? "";
  return parseDateTimestamp(today);
};

const isDespesaOverdue = (row: DespesaDashboardRow): boolean => {
  if (row.situacao === 3) return true;
  if (row.situacao === 2) return false;

  const dueTimestamp = parseDateTimestamp(row.raw.dataVencimento ?? row.data);
  const todayTimestamp = getTodayTimestamp();

  if (Number.isNaN(dueTimestamp) || Number.isNaN(todayTimestamp)) {
    return false;
  }

  return dueTimestamp < todayTimestamp;
};

const matchesVencimentoFilter = (
  row: DespesaDashboardRow,
  vencimento: string
): boolean => {
  if (!vencimento) return true;

  const dueTimestamp = parseDateTimestamp(row.raw.dataVencimento ?? row.data);
  const todayTimestamp = getTodayTimestamp();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (vencimento === "atrasadas") {
    return isDespesaOverdue(row);
  }

  if (vencimento === "semData") {
    return Number.isNaN(dueTimestamp);
  }

  if (row.situacao === 2 || Number.isNaN(dueTimestamp) || Number.isNaN(todayTimestamp)) {
    return false;
  }

  if (vencimento === "hoje") {
    return dueTimestamp === todayTimestamp;
  }

  if (vencimento === "proximos7") {
    return dueTimestamp >= todayTimestamp && dueTimestamp <= todayTimestamp + 7 * dayInMs;
  }

  return true;
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel carregar os dados de despesas.";
};

const isHttpNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const resolveDocumentoId = (despesa: DespesaDTO): number | undefined => {
  const idDocumento = Number(despesa.idDocumento ?? despesa.documento?.idDocumento);
  return Number.isFinite(idDocumento) && idDocumento > 0 ? idDocumento : undefined;
};

const buildDespesaRows = (
  despesas: DespesaDTO[],
  unidadesConsumidorasMap: Map<number, UnidadeConsumidoraDTO>,
  tiposDespesaMap: Map<number, TipoDespesaDTO>,
  tipoCodigosMap: Map<number, TipoCodigoDTO>,
  instituicoesMap: Map<number, InstituicaoDTO>,
  secretariasMap: Map<number, SecretariaDTO>
): DespesaDashboardRow[] => {
  return despesas
    .map((despesa) => {
      const unidadeConsumidora = despesa.idUnidadeConsumidora
        ? unidadesConsumidorasMap.get(despesa.idUnidadeConsumidora)
        : undefined;
      const resolvedTipoDespesaId =
        despesa.idTipoDespesa ?? unidadeConsumidora?.idTipoDespesa;
      const tipoDespesa =
        resolvedTipoDespesaId !== undefined
          ? tiposDespesaMap.get(resolvedTipoDespesaId)
          : undefined;
      const tipoCodigo =
        tipoDespesa?.idTipoCodigo !== undefined
          ? tipoCodigosMap.get(tipoDespesa.idTipoCodigo)
          : undefined;
      const resolvedDate = resolveDespesaDate(despesa);
      const resolvedValue = resolveDespesaValor(despesa);
      const situacao = resolveDespesaStatus(despesa);
      const solicitaUc = tipoDespesa?.solicitaUc === SOLICITA_UC_SIM;
      const resolvedUc = toTrimmedText(despesa.uc) || unidadeConsumidora?.identificador || "";
      const instituicaoId = despesa.idInstituicao ?? unidadeConsumidora?.idInstituicao ?? null;
      const instituicao = instituicaoId ? instituicoesMap.get(instituicaoId) : undefined;
      const secretariaId =
        instituicao?.idSecretaria ?? unidadeConsumidora?.idSecretaria ?? null;
      const secretaria = secretariaId ? secretariasMap.get(secretariaId) : undefined;
      const resolvedFornecedorId =
        despesa.idFornecedor ?? unidadeConsumidora?.idFornecedor ?? 0;
      const documento = despesa.documento
        ? normalizeDocumentoForUi(despesa.documento)
        : null;
      const idDocumento = resolveDocumentoId(despesa);
      const documentoConfiavel = Boolean(
        documento?.digitalizacao || idDocumento || despesa.hashDocumento
      );
      const normalizedRaw: DespesaDTO = {
        ...despesa,
        idTipoDespesa: resolvedTipoDespesaId,
        idInstituicao: instituicaoId ?? undefined,
        idOrcamento: despesa.idOrcamento ?? unidadeConsumidora?.idOrcamento,
        idFornecedor: resolvedFornecedorId,
        idDocumento,
        idUnidadeConsumidora: despesa.idUnidadeConsumidora ?? unidadeConsumidora?.id,
        uc: resolvedUc,
        valor: despesa.valor ?? despesa.valorPrevisto,
        documento,
      };

      return {
        id: despesa.id,
        registro: `#${String(despesa.id).padStart(3, "0")}`,
        categoria:
          tipoDespesa?.descricao ??
          despesa.categoria?.trim() ??
          "Categoria nao informada",
        tipoCodigoId: tipoDespesa?.idTipoCodigo ?? null,
        tipoCodigoNome:
          tipoCodigo?.nome?.trim() ||
          tipoCodigo?.descricao?.trim() ||
          "Tipo de codigo nao informado",
        instituicaoId,
        instituicaoNome:
          instituicao?.nome?.trim() ||
          (instituicaoId ? `Instituicao #${instituicaoId}` : "Instituicao nao informada"),
        secretariaId,
        secretariaNome:
          secretaria?.nome?.trim() ||
          (secretariaId ? `Secretaria #${secretariaId}` : "Secretaria nao informada"),
        descricao: resolveDespesaDescricao(normalizedRaw),
        valor: resolvedValue,
        valorFormatado: formatCurrency(resolvedValue),
        data: resolvedDate,
        dataFormatada: formatDate(resolvedDate),
        situacao,
        situacaoLabel: resolveDespesaStatusLabel(situacao),
        solicitaUc,
        solicitaUcLabel: solicitaUc ? "Sim" : "Nao",
        numeroDocumento: despesa.numeroDocumento ?? "",
        documento,
        documentoConfiavel,
        idDocumento,
        raw: normalizedRaw,
      };
    })
    .sort((current, next) => {
      const nextDate = parseDateTimestamp(next.data);
      const currentDate = parseDateTimestamp(current.data);

      if (Number.isNaN(nextDate) && Number.isNaN(currentDate)) {
        return next.id - current.id;
      }

      if (Number.isNaN(nextDate)) return -1;
      if (Number.isNaN(currentDate)) return 1;

      if (nextDate !== currentDate) {
        return nextDate - currentDate;
      }

      return next.id - current.id;
    });
};

const matchesDespesaFilters = (
  row: DespesaDashboardRow,
  filters: DespesasDashboardFilters
): boolean => {
  const searchTerm = normalizeText(filters.search);
  const searchTarget = normalizeText(
    `${row.descricao} ${row.numeroDocumento} ${row.id} ${row.categoria} ${row.tipoCodigoNome} ${row.instituicaoNome} ${row.secretariaNome} ${row.raw.codigo ?? ""} ${row.raw.uc ?? ""}`
  );

  if (searchTerm && !searchTarget.includes(searchTerm)) {
    return false;
  }

  if (!matchesDateRange(row.data, filters.dataInicio, filters.dataFim)) {
    const hasAnyDateFilter = Boolean(filters.dataInicio || filters.dataFim);
    if (hasAnyDateFilter) return false;
  }

  if (filters.idInstituicao) {
    if ((row.instituicaoId ?? 0) !== Number(filters.idInstituicao)) {
      return false;
    }
  }

  if (filters.idSecretaria) {
    if ((row.secretariaId ?? 0) !== Number(filters.idSecretaria)) {
      return false;
    }
  }

  if (filters.idTipoDespesa) {
    const rowTipoDespesa = row.raw.idTipoDespesa ?? 0;
    if (rowTipoDespesa !== Number(filters.idTipoDespesa)) {
      return false;
    }
  }

  if (filters.idTipoCodigo) {
    if ((row.tipoCodigoId ?? 0) !== Number(filters.idTipoCodigo)) {
      return false;
    }
  }

  if (!matchesVencimentoFilter(row, filters.vencimento)) {
    return false;
  }

  if (filters.solicitaUc) {
    const expectedSolicitaUc = Number(filters.solicitaUc) === SOLICITA_UC_SIM;
    if (row.solicitaUc !== expectedSolicitaUc) {
      return false;
    }
  }

  return true;
};

const matchesOrcamentoFilters = (
  orcamento: OrcamentoDTO,
  filters: DespesasDashboardFilters
): boolean => {
  if (filters.idTipoDespesa) {
    if ((orcamento.idTipoDespesa ?? 0) !== Number(filters.idTipoDespesa)) {
      return false;
    }
  }

  const hasDateFilter = Boolean(filters.dataInicio || filters.dataFim);
  if (hasDateFilter) {
    return matchesDateRange(
      resolveOrcamentoDate(orcamento),
      filters.dataInicio,
      filters.dataFim
    );
  }

  return true;
};

const buildDespesaPayload = (
  formData: Record<string, unknown>,
  data: DashboardData,
  currentDespesa?: DespesaDTO
): DespesaDTO => {
  const idUnidadeConsumidora = Number(
    formData.idUnidadeConsumidora ?? currentDespesa?.idUnidadeConsumidora ?? 0
  );
  if (!Number.isFinite(idUnidadeConsumidora) || idUnidadeConsumidora <= 0) {
    throw new Error("Selecione uma unidade consumidora valida.");
  }

  const unidadeConsumidora = data.unidadesConsumidoras.find(
    (item) => item.id === idUnidadeConsumidora
  );
  if (!unidadeConsumidora) {
    throw new Error("A unidade consumidora selecionada nao foi encontrada.");
  }

  const valorPrevisto = Number(
    formData.valorPrevisto ?? currentDespesa?.valorPrevisto ?? currentDespesa?.valor ?? 0
  );
  if (!Number.isFinite(valorPrevisto) || valorPrevisto <= 0) {
    throw new Error("Informe um valor previsto maior que zero.");
  }

  const consumoPrevisto = Number(
    formData.consumoPrevisto ?? currentDespesa?.consumoPrevisto ?? 0
  );
  if (!Number.isFinite(consumoPrevisto) || consumoPrevisto < 0) {
    throw new Error("Consumo previsto nao pode ser negativo.");
  }

  const valorPago = Number(formData.valorPago ?? currentDespesa?.valorPago ?? 0);
  if (!Number.isFinite(valorPago) || valorPago < 0) {
    throw new Error("Valor pago nao pode ser negativo.");
  }

  const consumoReal = Number(formData.consumoReal ?? currentDespesa?.consumoReal ?? 0);
  if (!Number.isFinite(consumoReal) || consumoReal < 0) {
    throw new Error("Consumo real nao pode ser negativo.");
  }

  const numeroDocumentoInformado = digitsOnly(
    formData.numeroDocumento ?? currentDespesa?.numeroDocumento ?? ""
  );
  if (!numeroDocumentoInformado) {
    throw new Error("Numero do documento deve conter apenas numeros.");
  }

  const codigoInformado = toTrimmedText(
    formData.codigo ?? currentDespesa?.codigo ?? unidadeConsumidora.identificador
  ).slice(0, 100);

  const usuarioResponsavelId =
    Number(formData.idUsuario) ||
    currentDespesa?.idUsuario ??
    authStorage.get()?.id ??
    data.usuarios.find((item) => item.situacao === SITUACAO_ATIVO)?.id;

  if (!usuarioResponsavelId) {
    throw new Error("Nao foi possivel identificar o usuario responsavel pela despesa.");
  }

  const formDataDataEmissao =
    typeof formData.dataEmissao === "string" ? formData.dataEmissao : undefined;
  const formDataDataEmicao =
    typeof formData.dataEmicao === "string" ? formData.dataEmicao : undefined;
  const formDataDataVencimento =
    typeof formData.dataVencimento === "string"
      ? formData.dataVencimento
      : undefined;
  const dataEmissao = ensureValidDate(
    formDataDataEmissao ??
      formDataDataEmicao ??
      currentDespesa?.dataEmissao ??
      currentDespesa?.dataEmicao
  );
  const dataVencimento = ensureValidDate(
    formDataDataVencimento ?? currentDespesa?.dataVencimento
  );

  if (!dataEmissao) {
    throw new Error("Informe uma data de emissao valida.");
  }

  if (!dataVencimento) {
    throw new Error("Informe uma data de vencimento valida.");
  }
  const situacao = Number(
    formData.status ??
      formData.situacao ??
      currentDespesa?.status ??
      currentDespesa?.situacao ??
      SITUACAO_ATIVO
  );

  if (!Number.isFinite(situacao) || situacao <= 0) {
    throw new Error("Selecione um status financeiro valido.");
  }

  return {
    id: currentDespesa?.id ?? 0,
    numeroDocumento: numeroDocumentoInformado,
    codigo: codigoInformado || unidadeConsumidora.identificador,
    uc: toTrimmedText(formData.uc) || unidadeConsumidora.identificador,
    dataEmissao,
    dataEmicao: dataEmissao,
    valorPrevisto,
    valorPago,
    consumoPrevisto,
    consumoReal,
    dataVencimento,
    dataPagamento:
      typeof formData.dataPagamento === "string" ? formData.dataPagamento : currentDespesa?.dataPagamento,
    status: situacao,
    situacao,
    idTipoDespesa: unidadeConsumidora.idTipoDespesa,
    idOrcamento: unidadeConsumidora.idOrcamento,
    idInstituicao: unidadeConsumidora.idInstituicao,
    idFornecedor: unidadeConsumidora.idFornecedor,
    idUsuario: usuarioResponsavelId,
    idUnidadeConsumidora,
  };
};

const hasPersistedDocumentoReference = (despesa: DespesaDTO): boolean => {
  return Boolean(
    despesa.hashDocumento ||
      despesa.nomeDocumento ||
      resolveDocumentoId(despesa) ||
      (despesa.documento?.isPersisted === true && despesa.documento.digitalizacao)
  );
};

const hasNewDocumentoPayload = (documento: unknown): boolean => {
  if (!isRecord(documento) || documento.isPersisted === true) return false;
  return typeof documento.digitalizacao === "string" && documento.digitalizacao.trim().length > 0;
};

const assertPersistedDocumentoLinkWasPreserved = (
  formData: Record<string, unknown>,
  payload: DespesaDTO,
  currentDespesa: DespesaDTO
) => {
  if (!hasPersistedDocumentoReference(currentDespesa) || hasNewDocumentoPayload(formData.documento)) {
    return;
  }

  if (!isRecord(formData.documento)) {
    throw new Error(
      "Esta despesa ja possui documento. Troque o arquivo para substituir ou mantenha o documento atual."
    );
  }

  const originalNumeroDocumento = digitsOnly(
    formData.documento.numeroDocumento ?? currentDespesa.numeroDocumento ?? ""
  );
  const nextNumeroDocumento = digitsOnly(payload.numeroDocumento ?? "");
  const originalFornecedor = Number(
    formData.documento.idFornecedor ?? currentDespesa.idFornecedor ?? 0
  );
  const nextFornecedor = Number(payload.idFornecedor ?? 0);
  const originalUc = Number(currentDespesa.idUnidadeConsumidora ?? 0);
  const nextUc = Number(payload.idUnidadeConsumidora ?? 0);

  const changedDocumentoKey =
    Boolean(originalNumeroDocumento) &&
    Boolean(nextNumeroDocumento) &&
    (originalNumeroDocumento !== nextNumeroDocumento ||
      originalFornecedor !== nextFornecedor);
  const changedUc = originalUc > 0 && nextUc > 0 && originalUc !== nextUc;

  if (changedDocumentoKey || changedUc) {
    throw new Error(
      "Para alterar UC, fornecedor ou numero do documento de uma despesa com anexo, troque tambem o documento."
    );
  }
};

const buildDocumentoPayload = (
  formData: Record<string, unknown>,
  despesaPayload: DespesaDTO,
  required: boolean
): DocumentoDTO | null => {
  if (!isRecord(formData.documento)) {
    if (required) {
      throw new Error("Selecione um documento para anexar a despesa.");
    }

    return null;
  }

  if (formData.documento.isPersisted === true) {
    return null;
  }

  const digitalizacao =
    typeof formData.documento.digitalizacao === "string"
      ? formData.documento.digitalizacao.trim()
      : "";

  if (!digitalizacao) {
    if (required) {
      throw new Error("Documento selecionado ainda nao foi convertido para Base64.");
    }

    return null;
  }

  const numeroDocumento = Number(
    formData.documento.numeroDocumento ?? despesaPayload.numeroDocumento
  );
  const idFornecedor = Number(
    formData.documento.idFornecedor ?? despesaPayload.idFornecedor
  );

  if (!Number.isFinite(numeroDocumento) || numeroDocumento <= 0) {
    throw new Error("Numero do documento deve conter apenas numeros.");
  }

  if (!Number.isFinite(idFornecedor) || idFornecedor <= 0) {
    throw new Error("Selecione um fornecedor valido para o documento.");
  }

  // O backend atual relaciona documento e despesa pelo numeroDocumento e pelo fornecedor.
  return {
    idDocumento: 0,
    digitalizacao,
    numeroDocumento,
    idFornecedor,
  };
};

const loadDashboardData = async (): Promise<DashboardData> => {
  const [
    despesasTodas,
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    unidadesConsumidorasAtivas,
    unidadesMedida,
    usuarios,
    unidadesConsumidorasAll,
  ] = await Promise.all([
    despesaService.getAllStatusData(),
    tipoCodigoService.getAllOptional(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    secretariaService.getAllData(),
    fornecedorService.getAllData(),
    unidadeConsumidoraService.getAllActiveData(),
    unidadeMedidaService.getAllData(),
    usuarioService.getAllData(),
    unidadeConsumidoraService.getAllData(),
  ]);

  return {
    despesas: filterActiveRecords(despesasTodas ?? []),
    tipoCodigos: tipoCodigos ?? [],
    tiposDespesa: tiposDespesa ?? [],
    orcamentos: filterActiveRecords(orcamentos ?? []),
    instituicoes: instituicoes ?? [],
    secretarias: secretarias ?? [],
    fornecedores: fornecedores ?? [],
    unidadesConsumidoras: unidadesConsumidorasAtivas ?? unidadesConsumidorasAll ?? [],
    unidadesMedida: unidadesMedida ?? [],
    usuarios: usuarios ?? [],
  };
};

const buildDespesaApiPayload = (payload: DespesaDTO): DespesaDTO => ({
  id: Number(payload.id ?? 0),
  numeroDocumento: payload.numeroDocumento ?? "",
  codigo: payload.codigo ?? "",
  dataEmissao: payload.dataEmissao ?? payload.dataEmicao ?? "",
  valorPrevisto: Number(payload.valorPrevisto ?? payload.consumoPrevisto ?? 0),
  valorPago: Number(payload.valorPago ?? 0),
  consumoPrevisto: Number(payload.consumoPrevisto ?? payload.valorPrevisto ?? 0),
  consumoReal: Number(payload.consumoReal ?? 0),
  dataVencimento: payload.dataVencimento ?? "",
  dataPagamento: payload.dataPagamento ?? undefined,
  status: Number(payload.status ?? payload.situacao ?? SITUACAO_ATIVO),
  idUsuario: Number(payload.idUsuario),
  idUnidadeConsumidora: Number(payload.idUnidadeConsumidora),
  nomeDocumento: payload.nomeDocumento,
  hashDocumento: payload.hashDocumento,
  documento: payload.documento,
  confirmarDocumentoDuplicado: payload.confirmarDocumentoDuplicado,
});

export const useDespesasDashboard = (
  initialData?: DashboardData,
  initialError: string | null = null
) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    initialData ?? EMPTY_DASHBOARD_DATA
  );
  const [filters, setFilters] = useState<DespesasDashboardFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(!initialData && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(
    initialData ? new Date().toISOString() : null
  );

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await loadDashboardData();

      setDashboardData(nextData);
      setError(null);
      setLastUpdatedAt(new Date().toISOString());
    } catch (loadError) {
      setDashboardData(EMPTY_DASHBOARD_DATA);
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData || initialError) return;
    void refetch();
  }, [initialData, initialError, refetch]);

  const tiposDespesaMap = useMemo(() => {
    return new Map(
      dashboardData.tiposDespesa.map((tipoDespesa) => [tipoDespesa.id, tipoDespesa])
    );
  }, [dashboardData.tiposDespesa]);

  const tipoCodigosMap = useMemo(() => {
    return new Map(
      dashboardData.tipoCodigos.map((tipoCodigo) => [tipoCodigo.id, tipoCodigo])
    );
  }, [dashboardData.tipoCodigos]);

  const unidadesConsumidorasMap = useMemo(() => {
    return new Map(
      dashboardData.unidadesConsumidoras.map((unidadeConsumidora) => [
        unidadeConsumidora.id,
        unidadeConsumidora,
      ])
    );
  }, [dashboardData.unidadesConsumidoras]);

  const instituicoesMap = useMemo(() => {
    return new Map(dashboardData.instituicoes.map((instituicao) => [instituicao.id, instituicao]));
  }, [dashboardData.instituicoes]);

  const secretariasMap = useMemo(() => {
    return new Map(
      dashboardData.secretarias.map((secretaria) => [
        secretaria.idSecretaria,
        secretaria,
      ])
    );
  }, [dashboardData.secretarias]);

  const despesas = useMemo(() => {
    return buildDespesaRows(
      filterActiveRecords(dashboardData.despesas),
      unidadesConsumidorasMap,
      tiposDespesaMap,
      tipoCodigosMap,
      instituicoesMap,
      secretariasMap
    );
  }, [
    dashboardData.despesas,
    instituicoesMap,
    secretariasMap,
    tipoCodigosMap,
    tiposDespesaMap,
    unidadesConsumidorasMap,
  ]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => matchesDespesaFilters(despesa, filters));
  }, [despesas, filters]);

  const filteredOrcamentos = useMemo(() => {
    return filterActiveRecords(dashboardData.orcamentos).filter((orcamento) =>
      matchesOrcamentoFilters(orcamento, filters)
    );
  }, [dashboardData.orcamentos, filters]);

  const summary = useMemo<DespesaDashboardSummary>(() => {
    const saida = filteredDespesas.reduce((accumulator, item) => accumulator + item.valor, 0);
    const entrada = filteredOrcamentos.reduce(
      (accumulator, item) => accumulator + resolveOrcamentoValor(item),
      0
    );

    return {
      saldoTotal: entrada - saida,
      entrada,
      saida,
    };
  }, [filteredDespesas, filteredOrcamentos]);

  const applyFilters = useCallback((nextFilters: Partial<DespesasDashboardFilters>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const createDespesa = useCallback(
    async (formData: Record<string, unknown>) => {
      const payload = buildDespesaPayload(formData, dashboardData);
      const documentoPayload = buildDocumentoPayload(formData, payload, true);

      if (!documentoPayload) {
        throw new Error("Selecione um documento para anexar a despesa.");
      }

      await despesaService.createData(buildDespesaApiPayload({
        ...payload,
        id: 0,
        documento: documentoPayload,
      }));
      await refetch();
    },
    [dashboardData, refetch]
  );

  const updateDespesa = useCallback(
    async (id: number, formData: Record<string, unknown>) => {
      const currentDespesa = dashboardData.despesas.find((despesa) => despesa.id === id);
      if (!currentDespesa) {
        throw new Error(`Despesa ${id} nao encontrada.`);
      }

      const payload = buildDespesaPayload(formData, dashboardData, currentDespesa);
      const documentoPayload = buildDocumentoPayload(formData, payload, false);
      assertPersistedDocumentoLinkWasPreserved(formData, payload, currentDespesa);

      await despesaService.updateData(id, buildDespesaApiPayload({
        ...payload,
        id,
        documento: documentoPayload ?? payload.documento,
      }));
      await refetch();
    },
    [dashboardData, refetch]
  );

  // Pagamento da despesa: exige comprovante, cria documento e define status=2 com dataPagamento.
  const updateDespesaPagamento = useCallback(
    async (
      id: number,
      overrides: { valorPago?: number; consumoReal?: number; documento?: unknown }
    ) => {
      const currentDespesa = dashboardData.despesas.find((despesa) => despesa.id === id);
      if (!currentDespesa) {
        throw new Error(`Despesa ${id} nao encontrada.`);
      }

      const documentoValue = overrides.documento as {
        digitalizacao?: string;
        fileName?: string;
        fileType?: string;
        fileSize?: number;
      } | null;
      const digitalizacao = documentoValue?.digitalizacao?.trim() ?? "";
      if (!digitalizacao) {
        throw new Error("Anexe o comprovante de pagamento.");
      }

      const numeroDocumento = digitsOnly(currentDespesa.numeroDocumento ?? "");
      if (!numeroDocumento) {
        throw new Error("Numero do documento deve conter apenas numeros.");
      }

      // Resolve fornecedor pela UC quando a despesa nao traz esse campo.
      const unidadeConsumidora = dashboardData.unidadesConsumidoras.find(
        (item) => item.id === currentDespesa.idUnidadeConsumidora
      );
      const idFornecedor = Number(
        currentDespesa.idFornecedor ?? unidadeConsumidora?.idFornecedor ?? 0
      );
      if (!Number.isFinite(idFornecedor) || idFornecedor <= 0) {
        throw new Error("Fornecedor da despesa nao foi identificado.");
      }

      const documentoPayload: DocumentoDTO = {
        idDocumento: 0,
        digitalizacao,
        numeroDocumento: Number(numeroDocumento),
        idFornecedor,
        fileName: documentoValue?.fileName,
        fileType: documentoValue?.fileType,
        fileSize: documentoValue?.fileSize,
      };

      const today = new Date().toISOString().slice(0, 10);
      const payload = buildDespesaPayload(
        {
          status: 2,
          situacao: 2,
          valorPago: overrides.valorPago ?? 0,
          consumoReal: overrides.consumoReal ?? 0,
          dataPagamento: today,
        },
        dashboardData,
        currentDespesa
      );

      await despesaService.updateData(
        id,
        buildDespesaApiPayload({
          ...payload,
          id,
          documento: documentoPayload,
        })
      );
      await refetch();
    },
    [dashboardData, refetch]
  );

  const removeDespesa = useCallback(
    async (id: number) => {
      try {
        await despesaService.delete(id);
      } catch (error) {
        if (isHttpNotFoundError(error)) {
          throw new Error("Despesa nao encontrada para exclusao.");
        }
        throw error;
      }

      await refetch();
    },
    [refetch]
  );

  const resolveDespesaDocumento = useCallback(
    async (despesa: DespesaDashboardRow): Promise<DespesaDashboardRow> => {
      if (despesa.documento?.digitalizacao || !despesa.idDocumento) {
        return despesa;
      }

      const documento = await documentoService.getDocumentoDataById(despesa.idDocumento);
      if (!documento) {
        return despesa;
      }

      return {
        ...despesa,
        documento,
        documentoConfiavel: true,
        raw: {
          ...despesa.raw,
          documento,
          idDocumento: despesa.idDocumento,
        },
      };
    },
    []
  );

  return useMemo(
    () => ({
      filters,
      despesas,
      filteredDespesas,
      tipoCodigos: dashboardData.tipoCodigos,
      tiposDespesa: dashboardData.tiposDespesa,
      orcamentos: dashboardData.orcamentos,
      instituicoes: dashboardData.instituicoes,
      secretarias: dashboardData.secretarias,
      fornecedores: dashboardData.fornecedores,
      unidadesConsumidoras: dashboardData.unidadesConsumidoras,
      unidadesMedida: dashboardData.unidadesMedida,
      usuarios: dashboardData.usuarios,
      summary,
      loading,
      error,
      empty: !loading && !error && filteredDespesas.length === 0,
      lastUpdatedAt,
      applyFilters,
      clearFilters,
      refetch,
      createDespesa,
      updateDespesa,
      updateDespesaPagamento,
      removeDespesa,
      resolveDespesaDocumento,
    }),
    [
      filters,
      despesas,
      filteredDespesas,
      dashboardData.tipoCodigos,
      dashboardData.tiposDespesa,
      dashboardData.orcamentos,
      dashboardData.instituicoes,
      dashboardData.secretarias,
      dashboardData.fornecedores,
      dashboardData.unidadesConsumidoras,
      dashboardData.unidadesMedida,
      dashboardData.usuarios,
      summary,
      loading,
      error,
      lastUpdatedAt,
      applyFilters,
      clearFilters,
      refetch,
      createDespesa,
      updateDespesa,
      updateDespesaPagamento,
      removeDespesa,
      resolveDespesaDocumento,
    ]
  );
};
