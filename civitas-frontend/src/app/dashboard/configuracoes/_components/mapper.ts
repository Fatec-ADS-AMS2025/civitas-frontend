import { getSituacaoLabel } from "@/global/situacao";

export const normalizeText = (value: unknown): string => {
  if (!value) return "";
  return String(value).trim();
};

export const toNumber = (value: unknown): number => {
  return Number(value) || 0;
};

export const mergeById = <T extends { id:number }>(
  active:T[],
  inactive:T[]
) => {

  const map = new Map<number,T>();

  active.forEach(item=>map.set(item.id,item));

  inactive.forEach(item=>{
    if(!map.has(item.id)){
      map.set(item.id,item);
    }
  });

  return [...map.values()];
};

export const mapRows = <T extends { situacao:number }>(
  items:T[]
) => {

  return items.map(item=>({
    ...item,
    situacaoLabel:getSituacaoLabel(item.situacao)
  }));
};