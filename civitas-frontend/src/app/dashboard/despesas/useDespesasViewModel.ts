"use client";

import { useMemo } from "react";
import type { InsightMetric } from "@/components/financeiro-insights";
import type {
  DespesaDashboardRow,
  DespesaDashboardSummary,
} from "@/hooks/useDespesasDashboard";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import type UsuarioDTO from "@/models/usuario";
import { buildFinanceRelations } from "@/lib/financeiro-relations";
import { MAX_EXPLORER_ITEMS } from "./despesas.constants";
import {
  formatCurrency,
  formatDateTime,
  getDespesaCodigo,
  mapDespesaToExportRow,
  normalizeSearchValue,
} from "./despesas.utils";
import { useDespesasOptions } from "./useDespesasOptions";

type UseDespesasViewModelInput = {
  despesas: DespesaDashboardRow[];
  filteredDespesas: DespesaDashboardRow[];
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  secretarias: SecretariaDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
  summary: DespesaDashboardSummary;
  lastUpdatedAt: string | null;
  activeModalDespesa: DespesaDashboardRow | null;
  relationsCodigoSearch: string;
  relationsInstituicaoSearch: string;
  listCodigoSearch: string;
  listInstituicaoSearch: string;
};

export function useDespesasViewModel(input: UseDespesasViewModelInput) {
  const {
    despesas,
    filteredDespesas,
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    usuarios,
    unidadesConsumidoras,
    summary,
    lastUpdatedAt,
    activeModalDespesa,
    relationsCodigoSearch,
    relationsInstituicaoSearch,
    listCodigoSearch,
    listInstituicaoSearch,
  } = input;

  const filteredRelations = useMemo(
    () =>
      buildFinanceRelations({
        despesas: filteredDespesas.map((item) => item.raw),
        instituicoes,
        secretarias,
        orcamentos,
        tiposDespesa,
      }),
    [filteredDespesas, instituicoes, orcamentos, secretarias, tiposDespesa]
  );

  const options = useDespesasOptions({
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    fornecedores,
    usuarios,
    unidadesConsumidoras,
    activeModalDespesa,
  });

  const normalizedRelationsCodigoSearch = normalizeSearchValue(relationsCodigoSearch);
  const normalizedRelationsInstituicaoSearch = normalizeSearchValue(
    relationsInstituicaoSearch
  );
  const normalizedListCodigoSearch = normalizeSearchValue(listCodigoSearch);
  const normalizedListInstituicaoSearch = normalizeSearchValue(listInstituicaoSearch);

  const panoramaMetrics = useMemo<InsightMetric[]>(
    () => [
      {
        label: "Codigos",
        value: String(filteredRelations.codigos.length),
        hint: "Agrupamentos ativos no recorte atual",
        tone: "teal",
      },
      {
        label: "Instituicoes",
        value: String(
          filteredRelations.instituicoes.filter((item) => item.quantidadeDespesas > 0)
            .length
        ),
        hint: "Com despesas no recorte filtrado",
        tone: "amber",
      },
      {
        label: "Secretarias",
        value: String(
          filteredRelations.secretarias.filter((item) => item.quantidadeDespesas > 0)
            .length
        ),
        hint: "Redes institucionais relacionadas",
        tone: "slate",
      },
      {
        label: "Gasto filtrado",
        value: formatCurrency(summary.saida),
        hint: "Soma financeira do painel atual",
        tone: "coral",
      },
    ],
    [filteredRelations, summary.saida]
  );

  const filteredCodigoGroups = useMemo(
    () =>
      filteredRelations.codigos.filter((codigo) => {
        const matchesCodigo =
          !normalizedRelationsCodigoSearch ||
          normalizeSearchValue(`${codigo.codigo} ${codigo.codigoNormalizado}`).includes(
            normalizedRelationsCodigoSearch
          );
        const matchesInstituicao =
          !normalizedRelationsInstituicaoSearch ||
          codigo.instituicoes.some((item) =>
            normalizeSearchValue(item).includes(normalizedRelationsInstituicaoSearch)
          ) ||
          codigo.secretarias.some((item) =>
            normalizeSearchValue(item).includes(normalizedRelationsInstituicaoSearch)
          );
        return matchesCodigo && matchesInstituicao;
      }),
    [
      filteredRelations.codigos,
      normalizedRelationsCodigoSearch,
      normalizedRelationsInstituicaoSearch,
    ]
  );

  const filteredInstituicaoGroups = useMemo(
    () =>
      filteredRelations.instituicoes.filter((instituicao) => {
        if (instituicao.quantidadeDespesas <= 0) return false;
        const searchText = `${instituicao.nome} ${instituicao.secretariaNome} ${instituicao.tipoInstituicaoNome}`;
        const matchesInstituicao =
          !normalizedRelationsInstituicaoSearch ||
          normalizeSearchValue(searchText).includes(normalizedRelationsInstituicaoSearch);
        const matchesCodigo =
          !normalizedRelationsCodigoSearch ||
          instituicao.codigos.some((codigo) =>
            normalizeSearchValue(`${codigo.codigo} ${codigo.codigoNormalizado}`).includes(
              normalizedRelationsCodigoSearch
            )
          );
        return matchesInstituicao && matchesCodigo;
      }),
    [
      filteredRelations.instituicoes,
      normalizedRelationsCodigoSearch,
      normalizedRelationsInstituicaoSearch,
    ]
  );

  const instituicaoNameMap = useMemo(
    () => new Map(instituicoes.map((item) => [item.id, item.nome] as const)),
    [instituicoes]
  );

  const visibleDespesas = useMemo(
    () =>
      filteredDespesas.filter((despesa) => {
        const codigo = getDespesaCodigo(despesa);
        const instituicaoNome =
          instituicaoNameMap.get(despesa.raw.idInstituicao ?? 0) ?? "";
        const matchesCodigo =
          !normalizedListCodigoSearch ||
          normalizeSearchValue(codigo).includes(normalizedListCodigoSearch);
        const matchesInstituicao =
          !normalizedListInstituicaoSearch ||
          normalizeSearchValue(instituicaoNome).includes(
            normalizedListInstituicaoSearch
          );
        return matchesCodigo && matchesInstituicao;
      }),
    [
      filteredDespesas,
      instituicaoNameMap,
      normalizedListCodigoSearch,
      normalizedListInstituicaoSearch,
    ]
  );

  const hasLocalListSearch = Boolean(listCodigoSearch || listInstituicaoSearch);

  return {
    ...options,
    panoramaMetrics,
    topCodigoGroups: filteredCodigoGroups.slice(0, MAX_EXPLORER_ITEMS),
    topInstituicaoGroups: filteredInstituicaoGroups.slice(0, MAX_EXPLORER_ITEMS),
    hasExplorerSearch: Boolean(relationsCodigoSearch || relationsInstituicaoSearch),
    visibleDespesas,
    hasLocalListSearch,
    filteredExportRows: visibleDespesas.map(mapDespesaToExportRow),
    allExportRows: despesas.map(mapDespesaToExportRow),
    listResume: hasLocalListSearch
      ? `${visibleDespesas.length} de ${filteredDespesas.length} despesas visiveis`
      : `${visibleDespesas.length} despesas encontradas`,
    lastUpdatedLabel: formatDateTime(lastUpdatedAt),
  };
}
