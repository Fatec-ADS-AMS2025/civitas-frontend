import type { TableColumn } from "@/components/Table/export-types";
import type { DespesasDashboardFilters } from "@/hooks/useDespesasDashboard";
import { SITUACAO_ATIVO } from "@/global/situacao";
import type { SelectOption } from "./despesas.types";

export const DESPESAS_EXPORT_COLUMNS: TableColumn[] = [
  { id: "codigo", label: "Codigo" },
  { id: "tipoCodigo", label: "Tipo de codigo" },
  { id: "categoria", label: "Categoria" },
  { id: "descricao", label: "Descricao" },
  { id: "valor", label: "Valor" },
  { id: "data", label: "Data" },
  { id: "situacao", label: "Situacao" },
];

export const DESPESAS_EXPORT_TITLE = "Listagem de despesas";
export const DESPESAS_EXPORT_FILE_NAME = "despesas";
export const MAX_EXPLORER_ITEMS = 6;

export const SOLICITA_UC_OPTIONS: SelectOption[] = [
  { value: "1", label: "Sim" },
  { value: "2", label: "Nao" },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { value: "1", label: "A pagar" },
  { value: "2", label: "Paga" },
  { value: "3", label: "Atrasada" },
];

export const VENCIMENTO_OPTIONS: SelectOption[] = [
  { value: "atrasadas", label: "Vencidas" },
  { value: "hoje", label: "Vencem hoje" },
  { value: "proximos7", label: "Proximos 7 dias" },
  { value: "semData", label: "Sem vencimento" },
];

export const INITIAL_FILTER_FORM: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idInstituicao: "",
  idSecretaria: "",
  idTipoCodigo: "",
  idTipoDespesa: "",
  situacao: "",
  vencimento: "",
  solicitaUc: "",
};

export const EMPTY_DESPESA_FORM: Record<string, unknown> = {
  id: 0,
  documento: "",
  numeroDocumento: "",
  codigo: "",
  idTipoCodigo: "",
  idTipoDespesa: "",
  idUnidadeConsumidora: "",
  uc: "",
  valorPrevisto: "",
  valorPago: "",
  consumoPrevisto: "",
  consumoReal: "",
  dataEmicao: "",
  dataVencimento: "",
  idInstituicao: "",
  idOrcamento: "",
  idFornecedor: "",
  idUsuario: "",
  situacao: SITUACAO_ATIVO,
};

export const FILTER_FIELD_CLASS_NAME =
  "despesas-filter-field w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-xs)] outline-none transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--secundary-1)] focus:ring-4 focus:ring-[var(--focus-ring)]";

export const ICON_BUTTON_CLASS_NAME =
  "flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-subtle)] hover:shadow-[var(--shadow-sm)]";
