import { getSituacaoLabel } from "@/global/situacao";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type TipoInstituicaoDTO from "@/models/tipoInstituicao";
import type UnidadeMedidaDTO from "@/models/unidadeMedida";
import type { TipoCodigoRow, TipoDespesaRow, TipoInstituicaoRow, UnidadeMedidaRow } from "./configuracoes.types";

export const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const asErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error)) return fallback;

  const match = error.message.match(/HTTP\s+\d+:\s*(.*)$/i);
  if (match?.[1]) return match[1];

  return error.message || fallback;
};

export const mergeById = <T extends { id: number }>(activeItems: T[], inactiveItems: T[]): T[] => {
  const map = new Map<number, T>();

  activeItems.forEach((item) => {
    map.set(item.id, item);
  });
  inactiveItems.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

export const mapTipoInstituicaoRows = (items: TipoInstituicaoDTO[]): TipoInstituicaoRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

export const mapTipoCodigoRows = (items: TipoCodigoDTO[]): TipoCodigoRow[] => {
  return items.map((item) => ({ ...item }));
};

export const mapUnidadeRows = (items: UnidadeMedidaDTO[]): UnidadeMedidaRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

export const mapTipoDespesaRows = (items: TipoDespesaDTO[], unidadesMedida: UnidadeMedidaDTO[]): TipoDespesaRow[] => {
  const unidadeMap = new Map(unidadesMedida.map((item) => [item.id, item.descricao]));

  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
    solicitaUcLabel: item.solicitaUc === 1 ? "Sim" : "Nao",
    unidadeMedidaLabel: unidadeMap.get(item.idUnidadeMedida) ?? `Unidade #${item.idUnidadeMedida}`,
  }));
};
