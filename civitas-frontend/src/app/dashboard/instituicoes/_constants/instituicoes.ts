import type { TableColumn } from "@/components/Table/export-types";
import { SITUACAO_ATIVO } from "@/global/situacao";

export const NOVA_INSTITUICAO = {
  id: 0,
  nome: "",
  cnpj: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  nomeRazaoSocial: "",
  situacao: SITUACAO_ATIVO,
  idTipoInstituicao: "",
  idSecretaria: "",
};

export const INSTITUICOES_COLUMNS: TableColumn[] = [
  { id: "nome", label: "Nome" },
  { id: "secretariaLabel", label: "Secretaria" },
  { id: "tipoInstituicaoLabel", label: "Tipo" },
  { id: "quantidadeDespesas", label: "Despesas" },
  { id: "quantidadeCodigos", label: "Codigos" },
  { id: "totalGastosFormatado", label: "Gastos" },
  { id: "saldoFormatado", label: "Saldo" },
  { id: "situacaoLabel", label: "Situacao", sortable: false },
];
