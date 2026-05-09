import { SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";

export type ConfigKind =
  | "tipoInstituicao"
  | "tipoDespesa"
  | "unidadeMedida";

export const SOLICITA_UC_OPTIONS = [
  { value: 1, label: "Sim" },
  { value: 2, label: "Nao" },
];

export const tipoInstituicaoColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const tipoDespesaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "solicitaUcLabel", label: "Solicita UC" },
  { id: "unidadeMedidaLabel", label: "Unidade" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const unidadeMedidaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "abreviatura", label: "Abreviatura" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const CONFIG_DEFINITIONS = {
  tipoInstituicao: {
    columns: tipoInstituicaoColumns,
  },

  tipoDespesa: {
    columns: tipoDespesaColumns,
  },

  unidadeMedida: {
    columns: unidadeMedidaColumns,
  },
};

export const EMPTY_MODEL = {
  id: 0,
  descricao: "",
  situacao: SITUACAO_ATIVO,
};

export {
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
};