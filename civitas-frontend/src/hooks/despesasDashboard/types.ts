import type DespesaDTO from "@/models/despesa";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import type UsuarioDTO from "@/models/usuario";

export const SOLICITA_UC_SIM = 1;

export type DespesasDashboardFilters = {
  search: string;
  dataInicio: string;
  dataFim: string;
  idTipoCodigo: string;
  idTipoDespesa: string;
  situacao: string;
  solicitaUc: string;
};

export type DespesaDashboardSummary = {
  saldoTotal: number;
  entrada: number;
  saida: number;
};

export type DespesaDashboardRow = {
  id: number;
  registro: string;
  categoria: string;
  tipoCodigoId: number | null;
  tipoCodigoNome: string;
  descricao: string;
  valor: number;
  valorFormatado: string;
  data: string;
  dataFormatada: string;
  situacao: number;
  situacaoLabel: string;
  solicitaUc: boolean;
  solicitaUcLabel: string;
  numeroDocumento: string;
  raw: DespesaDTO;
};

export type DashboardData = {
  despesas: DespesaDTO[];
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  secretarias: SecretariaDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
};

export const EMPTY_DASHBOARD_DATA: DashboardData = {
  despesas: [],
  tipoCodigos: [],
  tiposDespesa: [],
  orcamentos: [],
  instituicoes: [],
  secretarias: [],
  fornecedores: [],
  usuarios: [],
  unidadesConsumidoras: [],
};

export const DEFAULT_FILTERS: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idTipoCodigo: "",
  idTipoDespesa: "",
  situacao: "",
  solicitaUc: "",
};
