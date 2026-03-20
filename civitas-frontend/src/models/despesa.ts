export default interface DespesaDTO {
  id: number;
  numeroDocumento?: string;
  uc?: string;
  dataEmicao?: string;
  consumoPrevisto?: number;
  dataVencimento?: string;
  situacao?: number;
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