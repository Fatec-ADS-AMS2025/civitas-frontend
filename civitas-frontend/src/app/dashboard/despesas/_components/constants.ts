import { SITUACAO_ATIVO } from "@/global/situacao";

export const INITIAL_FILTER_FORM = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idTipoDespesa: "",
  situacao: "",
  solicitaUc: "",
};

export const EMPTY_DESPESA_FORM = {
  id: 0,
  numeroDocumento: "",
  idTipoDespesa: "",
  uc: "",
  consumoPrevisto: "",
  dataEmicao: "",
  dataVencimento: "",
  idInstituicao: "",
  idOrcamento: "",
  idFornecedor: "",
  idUsuario: "",
  situacao: SITUACAO_ATIVO,
};

export const SOLICITA_UC_OPTIONS = [
  { value: "1", label: "Sim" },
  { value: "2", label: "Nao" },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const formatDateTime = (value?: string | null) => {
  if (!value) return "Agora";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};