import type OrcamentoDTO from "@/models/orcamento";
import { parseDateTimestamp } from "./dates";
import {
  normalizeText,
  resolveOrcamentoDate,
} from "./formatters";
import {
  SOLICITA_UC_SIM,
  type DespesaDashboardRow,
  type DespesasDashboardFilters,
} from "./types";

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

export const matchesDespesaFilters = (
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

  if (filters.idTipoCodigo && (row.tipoCodigoId ?? 0) !== Number(filters.idTipoCodigo)) {
    return false;
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

export const matchesOrcamentoFilters = (
  orcamento: OrcamentoDTO,
  filters: DespesasDashboardFilters
): boolean => {
  if (filters.idTipoDespesa && (orcamento.idTipoDespesa ?? 0) !== Number(filters.idTipoDespesa)) {
    return false;
  }

  if (filters.situacao && Number(orcamento.situacao ?? 0) !== Number(filters.situacao)) {
    return false;
  }

  if (filters.dataInicio || filters.dataFim) {
    return matchesDateRange(
      resolveOrcamentoDate(orcamento),
      filters.dataInicio,
      filters.dataFim
    );
  }

  return true;
};
