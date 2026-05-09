import { SITUACAO_ATIVO } from "@/global/situacao";
import type DespesaDTO from "@/models/despesa";
import type OrcamentoDTO from "@/models/orcamento";
import { normalizeValidDateInput } from "./dates";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const normalizeText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const resolveDespesaDate = (despesa: DespesaDTO): string => {
  return (
    normalizeValidDateInput(despesa.data) ??
    normalizeValidDateInput(despesa.dataVencimento) ??
    normalizeValidDateInput(despesa.dataEmissao) ??
    normalizeValidDateInput(despesa.dataEmicao) ??
    ""
  );
};

export const resolveDespesaDescricao = (despesa: DespesaDTO): string => {
  return (
    despesa.descricao?.trim() ??
    despesa.numeroDocumento?.trim() ??
    `Despesa ${despesa.id}`
  );
};

export const resolveDespesaValor = (despesa: DespesaDTO): number => {
  return Number(despesa.valor ?? despesa.consumoPrevisto ?? 0);
};

export const resolveDespesaStatus = (despesa: DespesaDTO): number => {
  const normalizedStatus = Number(despesa.status ?? despesa.situacao ?? SITUACAO_ATIVO);
  return Number.isFinite(normalizedStatus) ? normalizedStatus : SITUACAO_ATIVO;
};

export const resolveDespesaStatusLabel = (status: number): string => {
  if (status === 1) return "A pagar";
  if (status === 2) return "Paga";
  if (status === 3) return "Atrasada";
  return "Nao informado";
};

export const resolveOrcamentoDate = (orcamento: OrcamentoDTO): string => {
  if (orcamento.anoOrcamento) {
    return `${orcamento.anoOrcamento}-01-01`;
  }

  if (orcamento.ano) {
    return `${orcamento.ano}-01-01`;
  }

  return "";
};

export const resolveOrcamentoValor = (orcamento: OrcamentoDTO): number => {
  return Number(orcamento.valorOrcamento ?? orcamento.valor ?? 0);
};
