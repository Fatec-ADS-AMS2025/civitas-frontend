export default interface UnidadeConsumidoraDTO {
  id: number;
  identificador: string;
  idInstituicao: number;
  idTipoDespesa: number;
  idSecretaria: number;
  idOrcamento: number;
  idFornecedor: number;
  excluido: boolean;
  dataExclusao?: string | null;
}
