import { normalizeDateInput } from "@/global/formPayload";
import { SITUACAO_ATIVO } from "@/global/situacao";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { EMPTY_DESPESA_FORM } from "./despesas.constants";
import type { DespesaExportRow, SelectOption } from "./despesas.types";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "Agora";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const toPositiveNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const normalizeSearchValue = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const ensureOption = (
  options: SelectOption[],
  currentValue: number | undefined,
  fallbackLabel: string
): SelectOption[] => {
  if (!currentValue || options.some((option) => Number(option.value) === currentValue)) {
    return options;
  }

  return [...options, { value: currentValue, label: fallbackLabel }];
};

export const getDespesaCodigo = (despesa: DespesaDashboardRow): string => {
  const codigo = despesa.raw.codigo;
  const codigoText = codigo === undefined || codigo === null ? "" : String(codigo).trim();
  return codigoText && codigoText !== "0" ? codigoText : "Sem codigo informado";
};

export const buildDespesaFormObject = (
  despesa?: DespesaDashboardRow | null
): Record<string, unknown> => {
  if (!despesa) {
    return EMPTY_DESPESA_FORM;
  }

  return {
    id: despesa.id,
    documento: "",
    numeroDocumento: despesa.raw.numeroDocumento ?? "",
    idFluxo: "",
    codigo: despesa.raw.codigo === "0" ? "" : despesa.raw.codigo ?? "",
    idTipoCodigo: despesa.tipoCodigoId ?? "",
    idTipoDespesa: despesa.raw.idTipoDespesa ?? "",
    idUnidadeConsumidora: despesa.raw.idUnidadeConsumidora ?? "",
    consumoPrevisto:
      despesa.raw.valorPrevisto ?? despesa.raw.consumoPrevisto ?? despesa.raw.valor ?? "",
    // O backend antigo expunha dataEmicao; o frontend ainda aceita ambos.
    dataEmicao:
      normalizeDateInput(despesa.raw.dataEmissao) ??
      normalizeDateInput(despesa.raw.dataEmicao) ??
      normalizeDateInput(despesa.raw.data) ??
      "",
    dataVencimento:
      normalizeDateInput(despesa.raw.dataVencimento) ??
      normalizeDateInput(despesa.raw.data) ??
      "",
    idInstituicao: despesa.raw.idInstituicao ?? "",
    idOrcamento: despesa.raw.idOrcamento ?? "",
    idFornecedor: despesa.raw.idFornecedor ?? despesa.raw.fornecedorId ?? "",
    idUsuario: despesa.raw.idUsuario ?? "",
    situacao: despesa.raw.status ?? despesa.raw.situacao ?? SITUACAO_ATIVO,
  };
};

export const getStatusBadgeClassName = (status: number): string => {
  if (status === 2) return "civitas-badge--status-active";
  if (status === 3) return "civitas-badge--status-inactive";
  return "civitas-badge--status-neutral";
};

export const mapDespesaToExportRow = (
  despesa: DespesaDashboardRow
): DespesaExportRow => ({
  id: despesa.id,
  codigo: getDespesaCodigo(despesa),
  tipoCodigo: despesa.tipoCodigoNome,
  categoria: despesa.categoria,
  descricao: despesa.descricao,
  valor: despesa.valorFormatado,
  data: despesa.dataFormatada,
  situacao: despesa.situacao,
});
