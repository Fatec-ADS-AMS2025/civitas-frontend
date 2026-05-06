"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  normalizeDateInput,
  normalizeDespesaPayload,
  validateDespesaDateRange,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
} from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { documentoService } from "@/hooks/documento";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import { usuarioService } from "@/hooks/usuario";
import type DespesaDTO from "@/models/despesa";
import type DocumentoDTO from "@/models/documento";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import type UsuarioDTO from "@/models/usuario";

const SOLICITA_UC_SIM = 1;

export type DespesasDashboardFilters = {
  search: string;
  dataInicio: string;
  dataFim: string;
  idTipoCodigo: string;
  idTipoDespesa: string;
  situacao: string;
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
  raw: DespesaDTO;
};

type DashboardData = {
  despesas: DespesaDTO[];
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  secretarias: SecretariaDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  documentos: DocumentoDTO[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  despesas: [],
  tipoCodigos: [],
  tiposDespesa: [],
  orcamentos: [],
  instituicoes: [],
  secretarias: [],
  fornecedores: [],
  usuarios: [],
  documentos: [],
  unidadesConsumidoras: [],
};

const DEFAULT_FILTERS: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idTipoCodigo: "",
  idTipoDespesa: "",
  situacao: "",
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

const resolveDespesaDate = (despesa: DespesaDTO): string => {
  return (
    normalizeDateInput(despesa.data) ??
    normalizeDateInput(despesa.dataVencimento) ??
    normalizeDateInput(despesa.dataEmissao) ??
    normalizeDateInput(despesa.dataEmicao) ??
    ""
  );
};

const resolveDespesaDescricao = (despesa: DespesaDTO): string => {
  return (
    despesa.descricao?.trim() ??
    despesa.numeroDocumento?.trim() ??
    `Despesa ${despesa.id}`
  );
};

const resolveDespesaValor = (despesa: DespesaDTO): number => {
  return Number(
    despesa.valor ??
      despesa.valorPrevisto ??
      despesa.consumoPrevisto ??
      0
  );
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

const mergeUniqueById = (despesas: DespesaDTO[]): DespesaDTO[] => {
  return Array.from(new Map(despesas.map((despesa) => [despesa.id, despesa])).values());
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

const isHttpBadRequestError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 400");
};

const isHttpMethodNotAllowedError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 405");
};

const logOptionalDashboardWarning = (message: string, error: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, error);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toPositiveNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
};

const resolveSelectedDocumento = (
  value: unknown
): Pick<DocumentoDTO, "numeroDocumento" | "idFornecedor"> | null => {
  if (!isRecord(value)) {
    return null;
  }

  const numeroDocumento = Number(value.numeroDocumento);
  const idFornecedor = Number(value.idFornecedor);

  if (!Number.isFinite(numeroDocumento) || numeroDocumento <= 0) {
    return null;
  }

  return {
    numeroDocumento,
    idFornecedor: Number.isFinite(idFornecedor) ? idFornecedor : 0,
  };
};

const safeLoadInactiveDespesas = async (): Promise<DespesaDTO[]> => {
  try {
    return (await despesaService.getInactiveOptional()) ?? [];
  } catch (error) {
    if (!isHttpNotFoundError(error) && !isHttpBadRequestError(error)) {
      logOptionalDashboardWarning("Erro ao carregar despesas inativas:", error);
    }

    return [];
  }
};

const buildDespesaRows = (
  despesas: DespesaDTO[],
  tiposDespesaMap: Map<number, TipoDespesaDTO>,
  tipoCodigosMap: Map<number, TipoCodigoDTO>,
  unidadesConsumidorasMap: Map<number, UnidadeConsumidoraDTO>
): DespesaDashboardRow[] => {
  return despesas
    .map((despesa) => {
      const unidadeConsumidora = despesa.idUnidadeConsumidora
        ? unidadesConsumidorasMap.get(despesa.idUnidadeConsumidora)
        : undefined;
      const enrichedDespesa: DespesaDTO = {
        ...despesa,
        idTipoDespesa: despesa.idTipoDespesa ?? unidadeConsumidora?.idTipoDespesa,
        idOrcamento: despesa.idOrcamento ?? unidadeConsumidora?.idOrcamento,
        idInstituicao: despesa.idInstituicao ?? unidadeConsumidora?.idInstituicao,
        idFornecedor: despesa.idFornecedor ?? unidadeConsumidora?.idFornecedor,
        uc: despesa.uc ?? unidadeConsumidora?.identificador,
      };
      const tipoDespesa =
        enrichedDespesa.idTipoDespesa !== undefined
          ? tiposDespesaMap.get(enrichedDespesa.idTipoDespesa)
          : undefined;
      const tipoCodigo =
        tipoDespesa?.idTipoCodigo !== undefined
          ? tipoCodigosMap.get(tipoDespesa.idTipoCodigo)
          : undefined;
      const resolvedDate = resolveDespesaDate(despesa);
      const resolvedValue = resolveDespesaValor(despesa);
      const situacao = resolveDespesaStatus(despesa);
      const solicitaUc = tipoDespesa?.solicitaUc === SOLICITA_UC_SIM;

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
        descricao: resolveDespesaDescricao(despesa),
        valor: resolvedValue,
        valorFormatado: formatCurrency(resolvedValue),
        data: resolvedDate,
        dataFormatada: formatDate(resolvedDate),
        situacao,
        situacaoLabel: resolveDespesaStatusLabel(situacao),
        solicitaUc,
        solicitaUcLabel: solicitaUc ? "Sim" : "Nao",
        numeroDocumento: despesa.numeroDocumento ?? "",
        raw: enrichedDespesa,
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
    `${row.descricao} ${row.numeroDocumento} ${row.id} ${row.categoria} ${row.tipoCodigoNome} ${row.raw.codigo ?? ""} ${row.raw.uc ?? ""}`
  );

  if (searchTerm && !searchTarget.includes(searchTerm)) {
    return false;
  }

  if (!matchesDateRange(row.data, filters.dataInicio, filters.dataFim)) {
    const hasAnyDateFilter = Boolean(filters.dataInicio || filters.dataFim);
    if (hasAnyDateFilter) return false;
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

  if (filters.situacao && row.situacao !== Number(filters.situacao)) {
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

  if (filters.situacao && Number(orcamento.situacao ?? 0) !== Number(filters.situacao)) {
    return false;
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

const validateLookupRelationship = (
  payload: DespesaDTO,
  data: DashboardData,
  selectedTipoCodigoId?: number
): string | undefined => {
  const unidadeConsumidora = data.unidadesConsumidoras.find(
    (item) => item.id === payload.idUnidadeConsumidora
  );
  if (!unidadeConsumidora) {
    return "Selecione uma unidade consumidora valida.";
  }

  const tipoDespesa = data.tiposDespesa.find((item) => item.id === payload.idTipoDespesa);
  if (!tipoDespesa) {
    return "Selecione um tipo de despesa valido.";
  }

  if (unidadeConsumidora.idTipoDespesa !== payload.idTipoDespesa) {
    return "A unidade consumidora nao pertence a categoria selecionada.";
  }

  if (
    selectedTipoCodigoId &&
    selectedTipoCodigoId > 0 &&
    tipoDespesa.idTipoCodigo !== selectedTipoCodigoId
  ) {
    return "Selecione uma categoria compativel com o tipo de codigo informado.";
  }

  const orcamento = data.orcamentos.find(
    (item) => item.idOrcamento === payload.idOrcamento
  );
  if (!orcamento) {
    return "Selecione um orcamento valido.";
  }

  if (unidadeConsumidora.idOrcamento !== payload.idOrcamento) {
    return "A unidade consumidora nao pertence ao orcamento selecionado.";
  }

  const instituicao = data.instituicoes.find((item) => item.id === payload.idInstituicao);
  if (!instituicao) {
    return "Selecione uma instituicao valida.";
  }

  if (unidadeConsumidora.idInstituicao !== payload.idInstituicao) {
    return "A unidade consumidora nao pertence a instituicao selecionada.";
  }

  const fornecedor = data.fornecedores.find(
    (item) => item.idFornecedor === payload.idFornecedor
  );
  if (!fornecedor) {
    return "Selecione um fornecedor valido.";
  }

  if (unidadeConsumidora.idFornecedor !== payload.idFornecedor) {
    return "O fornecedor do documento nao corresponde a unidade consumidora selecionada.";
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

  return undefined;
};

const buildDespesaPayload = (
  formData: Record<string, unknown>,
  data: DashboardData,
  currentDespesa?: DespesaDTO
): DespesaDTO => {
  const selectedDocumento = resolveSelectedDocumento(formData.documento);
  const selectedUnidadeConsumidoraId = toPositiveNumber(
    formData.idUnidadeConsumidora ?? currentDespesa?.idUnidadeConsumidora
  );
  const selectedUnidadeConsumidora = data.unidadesConsumidoras.find(
    (item) => item.id === selectedUnidadeConsumidoraId
  );
  const resolvedValor =
    formData.consumoPrevisto ??
    formData.valor ??
    formData.valorPrevisto ??
    currentDespesa?.valorPrevisto ??
    currentDespesa?.consumoPrevisto ??
    currentDespesa?.valor ??
    0;
  const normalizedPayload = normalizeDespesaPayload({
    id: Number(formData.id ?? currentDespesa?.id ?? 0),
    numeroDocumento:
      selectedDocumento?.numeroDocumento ??
      formData.numeroDocumento ?? currentDespesa?.numeroDocumento ?? "",
    codigo: formData.codigo ?? currentDespesa?.codigo ?? "",
    uc: formData.uc ?? currentDespesa?.uc ?? "",
    dataEmissao:
      formData.dataEmissao ??
      formData.dataEmicao ??
      currentDespesa?.dataEmissao ??
      currentDespesa?.dataEmicao ??
      "",
    dataEmicao:
      formData.dataEmissao ??
      formData.dataEmicao ??
      currentDespesa?.dataEmissao ??
      currentDespesa?.dataEmicao ??
      "",
    valorPrevisto: resolvedValor,
    valorPago: formData.valorPago ?? currentDespesa?.valorPago ?? 0,
    consumoPrevisto: resolvedValor,
    consumoReal: formData.consumoReal ?? currentDespesa?.consumoReal ?? 0,
    dataVencimento:
      formData.dataVencimento ??
      currentDespesa?.dataVencimento ??
      currentDespesa?.data ??
      "",
    status:
      formData.status ??
      formData.situacao ??
      currentDespesa?.status ??
      currentDespesa?.situacao ??
      SITUACAO_ATIVO,
    situacao: formData.situacao ?? currentDespesa?.situacao ?? SITUACAO_ATIVO,
    idUnidadeConsumidora: selectedUnidadeConsumidoraId,
    idTipoDespesa:
      selectedUnidadeConsumidora?.idTipoDespesa ??
      formData.idTipoDespesa ??
      currentDespesa?.idTipoDespesa,
    idOrcamento:
      selectedUnidadeConsumidora?.idOrcamento ??
      formData.idOrcamento ??
      currentDespesa?.idOrcamento,
    idInstituicao:
      selectedUnidadeConsumidora?.idInstituicao ??
      formData.idInstituicao ??
      currentDespesa?.idInstituicao,
    idFornecedor:
      selectedDocumento?.idFornecedor ??
      selectedUnidadeConsumidora?.idFornecedor ??
      formData.idFornecedor ??
      currentDespesa?.idFornecedor ??
      currentDespesa?.fornecedorId,
    idUsuario: formData.idUsuario ?? currentDespesa?.idUsuario,
  }) as DespesaDTO;

  if (!normalizedPayload.numeroDocumento) {
    throw new Error("Numero do documento deve conter apenas numeros.");
  }

  if (!normalizedPayload.dataEmicao) {
    throw new Error("Data de emissao invalida.");
  }

  if (!normalizedPayload.dataVencimento) {
    throw new Error("Data de vencimento invalida.");
  }

  const dateRangeError = validateDespesaDateRange(
    normalizedPayload.dataEmicao,
    normalizedPayload.dataVencimento
  );

  if (dateRangeError) {
    throw new Error(dateRangeError);
  }

  const consumoPrevisto = Number(normalizedPayload.consumoPrevisto ?? 0);
  if (Number.isNaN(consumoPrevisto) || consumoPrevisto < 0) {
    throw new Error("Valor da despesa nao pode ser negativo.");
  }
  const valorPrevisto = Number(normalizedPayload.valorPrevisto ?? consumoPrevisto);
  const valorPago = Number(normalizedPayload.valorPago ?? 0);
  const consumoReal = Number(normalizedPayload.consumoReal ?? 0);
  if ([valorPrevisto, valorPago, consumoReal].some((value) => Number.isNaN(value) || value < 0)) {
    throw new Error("Valores financeiros e de consumo nao podem ser negativos.");
  }

  const selectedTipoCodigoId = Number(formData.idTipoCodigo ?? 0);
  const lookupError = validateLookupRelationship(
    normalizedPayload,
    data,
    Number.isFinite(selectedTipoCodigoId) ? selectedTipoCodigoId : 0
  );
  if (lookupError) {
    throw new Error(lookupError);
  }

  return {
    ...normalizedPayload,
    id: currentDespesa?.id ?? Number(normalizedPayload.id ?? 0),
    valorPrevisto,
    valorPago,
    consumoPrevisto,
    consumoReal,
    status: Number(normalizedPayload.status ?? normalizedPayload.situacao ?? SITUACAO_ATIVO),
    situacao: Number(normalizedPayload.situacao ?? SITUACAO_ATIVO),
    idUnidadeConsumidora: Number(normalizedPayload.idUnidadeConsumidora),
    idTipoDespesa: Number(normalizedPayload.idTipoDespesa),
    idOrcamento: Number(normalizedPayload.idOrcamento),
    idInstituicao: Number(normalizedPayload.idInstituicao),
    idFornecedor: Number(normalizedPayload.idFornecedor),
    idUsuario: Number(normalizedPayload.idUsuario),
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
    usuarios,
    documentos,
    unidadesConsumidoras,
  ] = await Promise.all([
    despesaService.getAllStatusData(),
    tipoCodigoService.getAllOptional(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    secretariaService.getAllData(),
    fornecedorService.getAllData(),
    usuarioService.getAllData(),
    documentoService.getAllData(),
    unidadeConsumidoraService.getAllData(),
  ]);

  return {
    despesas: mergeUniqueById([...(despesasTodas ?? []), ...(await safeLoadInactiveDespesas())]),
    tipoCodigos: tipoCodigos ?? [],
    tiposDespesa: tiposDespesa ?? [],
    orcamentos: orcamentos ?? [],
    instituicoes: instituicoes ?? [],
    secretarias: secretarias ?? [],
    fornecedores: fornecedores ?? [],
    usuarios: usuarios ?? [],
    documentos: documentos ?? [],
    unidadesConsumidoras: unidadesConsumidoras ?? [],
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
  status: Number(payload.status ?? payload.situacao ?? SITUACAO_ATIVO),
  idUsuario: Number(payload.idUsuario),
  idUnidadeConsumidora: Number(payload.idUnidadeConsumidora),
});

export const useDespesasDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);
  const [filters, setFilters] = useState<DespesasDashboardFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

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
    void refetch();
  }, [refetch]);

  const tiposDespesaMap = useMemo(() => {
    return new Map(dashboardData.tiposDespesa.map((tipoDespesa) => [tipoDespesa.id, tipoDespesa]));
  }, [dashboardData.tiposDespesa]);

  const tipoCodigosMap = useMemo(() => {
    return new Map(dashboardData.tipoCodigos.map((tipoCodigo) => [tipoCodigo.id, tipoCodigo]));
  }, [dashboardData.tipoCodigos]);

  const unidadesConsumidorasMap = useMemo(() => {
    return new Map(
      dashboardData.unidadesConsumidoras.map((unidadeConsumidora) => [
        unidadeConsumidora.id,
        unidadeConsumidora,
      ])
    );
  }, [dashboardData.unidadesConsumidoras]);

  const despesas = useMemo(() => {
    return buildDespesaRows(
      dashboardData.despesas,
      tiposDespesaMap,
      tipoCodigosMap,
      unidadesConsumidorasMap
    );
  }, [dashboardData.despesas, tiposDespesaMap, tipoCodigosMap, unidadesConsumidorasMap]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => matchesDespesaFilters(despesa, filters));
  }, [despesas, filters]);

  const filteredOrcamentos = useMemo(() => {
    return dashboardData.orcamentos.filter((orcamento) =>
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
      await despesaService.createData(buildDespesaApiPayload({
        ...payload,
        id: 0,
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
      await despesaService.updateData(id, buildDespesaApiPayload({
        ...payload,
        id,
      }));
      await refetch();
    },
    [dashboardData, refetch]
  );

  const removeDespesa = useCallback(
    async (id: number) => {
      try {
        await despesaService.delete(id);
      } catch (error) {
        if (
          isHttpNotFoundError(error) ||
          isHttpMethodNotAllowedError(error)
        ) {
          await despesaService.alterarSituacao(id);
        } else {
          throw error;
        }
      }

      await refetch();
    },
    [refetch]
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
      usuarios: dashboardData.usuarios,
      documentos: dashboardData.documentos,
      unidadesConsumidoras: dashboardData.unidadesConsumidoras,
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
      removeDespesa,
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
      dashboardData.usuarios,
      dashboardData.documentos,
      dashboardData.unidadesConsumidoras,
      summary,
      loading,
      error,
      lastUpdatedAt,
      applyFilters,
      clearFilters,
      refetch,
      createDespesa,
      updateDespesa,
      removeDespesa,
    ]
  );
};
