import type { FormOption } from "@/components/Form/form";

export const SITUACAO_ATIVO = 1;
export const SITUACAO_INATIVO = 2;

export const SITUACAO_OPTIONS: FormOption[] = [
  { value: SITUACAO_ATIVO, label: "Ativo" },
  { value: SITUACAO_INATIVO, label: "Inativo" },
];

export const getSituacaoLabel = (value: number | null | undefined): string => {
  if (value === SITUACAO_ATIVO) return "Ativo";
  if (value === SITUACAO_INATIVO) return "Inativo";
  return "Não informado";
};
