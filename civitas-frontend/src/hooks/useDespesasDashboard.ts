"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { despesaService } from "@/hooks/despesa";
import { buildDespesaPayload } from "./despesasDashboard/payload";
import { buildDespesaRows } from "./despesasDashboard/rows";
import {
  DEFAULT_FILTERS,
  EMPTY_DASHBOARD_DATA,
  type DashboardData,
} from "./despesasDashboard/types";
import { loadDashboardData, toErrorMessage } from "./despesasDashboard/loaders";
import {
  matchesDespesaFilters,
  matchesOrcamentoFilters,
} from "./despesasDashboard/filters";
import { resolveOrcamentoValor } from "./despesasDashboard/formatters";

export type {
  DespesaDashboardRow,
  DespesaDashboardSummary,
  DespesasDashboardFilters,
} from "./despesasDashboard/types";

const STATUS_ATRASADO = 3;

export const useDespesasDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [hiddenDespesaIds, setHiddenDespesaIds] = useState<Set<number>>(() => new Set());
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

  const despesas = useMemo(() => {
    return buildDespesaRows(dashboardData.despesas, tiposDespesaMap, tipoCodigosMap).filter(
      (despesa) => !hiddenDespesaIds.has(despesa.id)
    );
  }, [dashboardData.despesas, hiddenDespesaIds, tiposDespesaMap, tipoCodigosMap]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => matchesDespesaFilters(despesa, filters));
  }, [despesas, filters]);

  const filteredOrcamentos = useMemo(() => {
    return dashboardData.orcamentos.filter((orcamento) =>
      matchesOrcamentoFilters(orcamento, filters)
    );
  }, [dashboardData.orcamentos, filters]);

  const summary = useMemo(() => {
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

  const applyFilters = useCallback((nextFilters: Partial<typeof DEFAULT_FILTERS>) => {
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
      await despesaService.createFromDashboard({
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
      await despesaService.updateFromDashboard(id, {
        ...payload,
        id,
      });
      await refetch();
    },
    [dashboardData, refetch]
  );

  const removeDespesa = useCallback(
    async (id: number) => {
      await despesaService.alterarStatusFromDashboard(id, STATUS_ATRASADO);
      setHiddenDespesaIds((currentIds) => new Set(currentIds).add(id));
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
