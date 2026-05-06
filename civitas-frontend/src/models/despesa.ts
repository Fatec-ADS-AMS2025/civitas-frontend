export default interface DespesaDTO {
  id: number;
  numeroDocumento?: string;
  codigo?: string;
  uc?: string;
  dataEmissao?: string;
  dataEmicao?: string;
  valorPrevisto?: number;
  valorPago?: number;
  consumoPrevisto?: number;
  consumoReal?: number;
  dataVencimento?: string;
  status?: number;
  situacao?: number;
  idUnidadeConsumidora?: number;
  idTipoDespesa?: number;
  idOrcamento?: number;
  idInstituicao?: number;
  idFornecedor?: number;
  idUsuario?: number;

  // Legacy fields still consumed by existing financial UI mapping.
  descricao?: string;
  valor?: number;
  data?: string;
  categoria?: string;
  fornecedorId?: number;
  secretariaId?: number;
}
