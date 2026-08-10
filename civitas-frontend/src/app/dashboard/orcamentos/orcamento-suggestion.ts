import type OrcamentoDTO from "@/models/orcamento";

export type OrcamentoSuggestionStatus = "idle" | "available" | "empty";

export type OrcamentoSuggestionFilters = {
  idInstituicao?: unknown;
  idTipoDespesa?: unknown;
};

export type OrcamentoSuggestionResult = {
  status: OrcamentoSuggestionStatus;
  averageValue?: number;
  count: number;
};

const toPositiveNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
};

const getOrcamentoValue = (orcamento: OrcamentoDTO): number | null => {
  return toPositiveNumber(orcamento.valorOrcamento ?? orcamento.valor);
};

export const calculateOrcamentoSuggestion = (
  orcamentos: OrcamentoDTO[],
  filters: OrcamentoSuggestionFilters,
): OrcamentoSuggestionResult => {
  const idInstituicao = toPositiveNumber(filters.idInstituicao);
  const idTipoDespesa = toPositiveNumber(filters.idTipoDespesa);

  if (!idInstituicao || !idTipoDespesa) {
    return {
      status: "idle",
      count: 0,
    };
  }

  const values = orcamentos
    .filter(
      (orcamento) =>
        Number(orcamento.idInstituicao) === idInstituicao && Number(orcamento.idTipoDespesa) === idTipoDespesa,
    )
    .map(getOrcamentoValue)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return {
      status: "empty",
      count: 0,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    status: "available",
    averageValue: total / values.length,
    count: values.length,
  };
};
