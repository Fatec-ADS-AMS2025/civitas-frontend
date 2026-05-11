export default interface DocumentoDTO {
  idDocumento: number;
  digitalizacao: string;
  numeroDocumento: number;
  idFornecedor: number;
  idFluxo?: number;
}
