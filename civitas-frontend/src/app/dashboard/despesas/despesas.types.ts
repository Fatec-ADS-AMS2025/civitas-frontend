import type { Dispatch, SetStateAction } from "react";
import type { InsightMetric } from "@/components/financeiro-insights";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import type { FinanceCodigoResumo, FinanceInstituicaoResumo } from "@/lib/financeiro-relations";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type DespesaExportRow = {
  id: number;
  codigo: string;
  tipoCodigo: string;
  categoria: string;
  descricao: string;
  valor: string;
  data: string;
  situacao: number;
};

export type DespesasExplorerState = {
  codigoSearch: string;
  setCodigoSearch: Dispatch<SetStateAction<string>>;
  instituicaoSearch: string;
  setInstituicaoSearch: Dispatch<SetStateAction<string>>;
};

export type DespesasListSearchState = {
  codigoSearch: string;
  setCodigoSearch: Dispatch<SetStateAction<string>>;
  instituicaoSearch: string;
  setInstituicaoSearch: Dispatch<SetStateAction<string>>;
};

export type DespesasExplorerData = {
  metrics: InsightMetric[];
  topCodigoGroups: FinanceCodigoResumo[];
  topInstituicaoGroups: FinanceInstituicaoResumo[];
  hasExplorerSearch: boolean;
};

export type DespesasTableData = {
  visibleDespesas: DespesaDashboardRow[];
  hasLocalListSearch: boolean;
  listResume: string;
  lastUpdatedLabel: string;
};
