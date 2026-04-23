"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  normalizeDateInput,
  normalizeDespesaPayload,
  validateDespesaDateRange,
  validateRequiredUc,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
} from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { usuarioService } from "@/hooks/usuario";
import type DespesaDTO from "@/models/despesa";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UsuarioDTO from "@/models/usuario";

const SOLICITA_UC_SIM = 1;

export type DespesasDashboardFilters = {
  search: string;
  dataInicio: string;
  dataFim: string;
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
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  despesas: [],
  tiposDespesa: [],
  orcamentos: [],
  instituicoes: [],
  fornecedores: [],
  usuarios: [],
};

const DEFAULT_FILTERS: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
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
  return Number(despesa.valor ?? despesa.consumoPrevisto ?? 0);
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

const safeLoadInactiveDespesas = async (): Promise<DespesaDTO[]> => {
  try {
    return (await despesaService.getInactiveOptional()) ?? [];
  } catch (error) {
    if (!isHttpNotFoundError(error) && !isHttpBadRequestError(error)) {
      console.error("Erro ao carregar despesas inativas:", error);
    }

    return [];
  }
};

const buildDespesaRows = (
  despesas: DespesaDTO[],
  tiposDespesaMap: Map<number, TipoDespesaDTO>
): DespesaDashboardRow[] => {
  return despesas
    .map((despesa) => {
      const tipoDespesa =
        despesa.idTipoDespesa !== undefined
          ? tiposDespesaMap.get(despesa.idTipoDespesa)
          : undefined;
      const resolvedDate = resolveDespesaDate(despesa);
      const resolvedValue = resolveDespesaValor(despesa);
      const situacao = Number(despesa.situacao ?? SITUACAO_ATIVO);
      const solicitaUc = tipoDespesa?.solicitaUc === SOLICITA_UC_SIM;

      return {
        id: despesa.id,
        registro: `#${String(despesa.id).padStart(3, "0")}`,
        categoria:
          tipoDespesa?.descricao ??
          despesa.categoria?.trim() ??
          "Categoria nao informada",
        descricao: resolveDespesaDescricao(despesa),
        valor: resolvedValue,
        valorFormatado: formatCurrency(resolvedValue),
        data: resolvedDate,
        dataFormatada: formatDate(resolvedDate),
        situacao,
        situacaoLabel: getSituacaoLabel(situacao),
        solicitaUc,
        solicitaUcLabel: solicitaUc ? "Sim" : "Nao",
        numeroDocumento: despesa.numeroDocumento ?? "",
        raw: despesa,
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
    `${row.descricao} ${row.numeroDocumento} ${row.id} ${row.categoria}`
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
  data: DashboardData
): string | undefined => {
  const tipoDespesa = data.tiposDespesa.find((item) => item.id === payload.idTipoDespesa);
  if (!tipoDespesa) {
    return "Selecione um tipo de despesa valido.";
  }

  const orcamento = data.orcamentos.find(
    (item) => item.idOrcamento === payload.idOrcamento
  );
  if (!orcamento) {
    return "Selecione um orcamento valido.";
  }

  const instituicao = data.instituicoes.find((item) => item.id === payload.idInstituicao);
  if (!instituicao) {
    return "Selecione uma instituicao valida.";
  }

  const fornecedor = data.fornecedores.find(
    (item) => item.idFornecedor === payload.idFornecedor
  );
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

  const ucError = validateRequiredUc(payload.uc, tipoDespesa.solicitaUc === SOLICITA_UC_SIM);
  if (ucError) {
    return ucError;
  }

  return undefined;
};

const buildDespesaPayload = (
  formData: Record<string, unknown>,
  data: DashboardData,
  currentDespesa?: DespesaDTO
): DespesaDTO => {
  const normalizedPayload = normalizeDespesaPayload({
    id: Number(formData.id ?? currentDespesa?.id ?? 0),
    numeroDocumento:
      formData.numeroDocumento ?? currentDespesa?.numeroDocumento ?? "",
    uc: formData.uc ?? currentDespesa?.uc ?? "",
    dataEmicao: formData.dataEmicao ?? currentDespesa?.dataEmicao ?? "",
    consumoPrevisto:
      formData.consumoPrevisto ??
      formData.valor ??
      currentDespesa?.consumoPrevisto ??
      currentDespesa?.valor ??
      0,
    dataVencimento:
      formData.dataVencimento ??
      currentDespesa?.dataVencimento ??
      currentDespesa?.data ??
      "",
    situacao: formData.situacao ?? currentDespesa?.situacao ?? SITUACAO_ATIVO,
    idTipoDespesa: formData.idTipoDespesa ?? currentDespesa?.idTipoDespesa,
    idOrcamento: formData.idOrcamento ?? currentDespesa?.idOrcamento,
    idInstituicao: formData.idInstituicao ?? currentDespesa?.idInstituicao,
    idFornecedor:
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

  const lookupError = validateLookupRelationship(normalizedPayload, data);
  if (lookupError) {
    throw new Error(lookupError);
  }

  return {
    ...normalizedPayload,
    id: currentDespesa?.id ?? Number(normalizedPayload.id ?? 0),
    consumoPrevisto,
    situacao: Number(normalizedPayload.situacao ?? SITUACAO_ATIVO),
    idTipoDespesa: Number(normalizedPayload.idTipoDespesa),
    idOrcamento: Number(normalizedPayload.idOrcamento),
    idInstituicao: Number(normalizedPayload.idInstituicao),
    idFornecedor: Number(normalizedPayload.idFornecedor),
    idUsuario: Number(normalizedPayload.idUsuario),
  };
};

const loadDashboardData = async (): Promise<DashboardData> => {
  const [
    despesasAtivas,
    despesasInativas,
    tiposDespesa,
    orcamentos,
    instituicoes,
    fornecedores,
    usuarios,
  ] = await Promise.all([
    despesaService.getAllData(),
    safeLoadInactiveDespesas(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    fornecedorService.getAllData(),
    usuarioService.getAllData(),
  ]);

  return {
    despesas: mergeUniqueById([...(despesasAtivas ?? []), ...(despesasInativas ?? [])]),
    tiposDespesa: tiposDespesa ?? [],
    orcamentos: orcamentos ?? [],
    instituicoes: instituicoes ?? [],
    fornecedores: fornecedores ?? [],
    usuarios: usuarios ?? [],
  };
};

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

  const despesas = useMemo(() => {
    return buildDespesaRows(dashboardData.despesas, tiposDespesaMap);
  }, [dashboardData.despesas, tiposDespesaMap]);

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
      await despesaService.createData({
        ...payload,
        id: 0,
      });
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
      await despesaService.updateData(id, {
        ...payload,
        id,
      });
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
      tiposDespesa: dashboardData.tiposDespesa,
      orcamentos: dashboardData.orcamentos,
      instituicoes: dashboardData.instituicoes,
      fornecedores: dashboardData.fornecedores,
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
      removeDespesa,
    }),
    [
      filters,
      despesas,
      filteredDespesas,
      dashboardData.tiposDespesa,
      dashboardData.orcamentos,
      dashboardData.instituicoes,
      dashboardData.fornecedores,
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
      removeDespesa,
    ]
  );
};
