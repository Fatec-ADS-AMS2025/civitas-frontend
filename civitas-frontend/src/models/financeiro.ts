export interface FinanceiroFiltrosDTO {
  dataInicio?: string;
  dataFim?: string;
  status?: number;
  instituicaoId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface FinanceiroTransacaoDTO {
  id: number;
  tipo: 'despesa' | 'orcamento';
  descricao: string;
  valor: number;
  data: string;
  situacao?: number;
  instituicaoId?: number;
  referenciaId?: number;
}

export interface FinanceiroResumoDTO {
  totalDespesas: number;
  totalOrcamentos: number;
  saldo: number;
  balanca: number;
  totalTransacoes: number;
  periodoInicio?: string;
  periodoFim?: string;
}

export interface SecretariaGastosDTO {
  idSecretaria: number;
  nomeSecretaria: string;
  quantidadeInstituicoes: number;
  quantidadeDespesas: number;
  totalGastos: number;
}

export interface InstituicaoGastosDTO {
  idInstituicao: number;
  nomeInstituicao: string;
  quantidadeDespesas: number;
  totalGastos: number;
}

export interface FinanceiroInstituicaoMacroDTO extends InstituicaoGastosDTO {
  secretariaId?: number;
  secretariaNome: string;
}

export interface FinanceiroPanoramaDTO {
  secretarias: SecretariaGastosDTO[];
  instituicoes: FinanceiroInstituicaoMacroDTO[];
}

export interface FinanceiroPayloadDTO {
  tipo: 'despesa' | 'orcamento';
  descricao?: string;
  valor?: number;
  data?: string;
  situacao?: number;
  categoria?: string;
  idInstituicao?: number;
  fornecedorId?: number;
  secretariaId?: number;
  anoOrcamento?: number;
  valorOrcamento?: number;

  // Campos alinhados ao novo contrato da API
  numeroDocumento?: string;
  uc?: string;
  dataEmicao?: string;
  consumoPrevisto?: number;
  dataVencimento?: string;
  idTipoDespesa?: number;
  idOrcamento?: number;
  idFornecedor?: number;
  idUsuario?: number;
}
