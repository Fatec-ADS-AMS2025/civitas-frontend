export default interface TipoDespesaDTO {
  id: number;
  descricao: string;
  solicitaUc: number;
  situacao: number;
  idUnidadeMedida: number;
  idTipoCodigo?: number;
}
