export default interface DocumentoDTO {
  idDocumento: number;
  digitalizacao: string;
  numeroDocumento: number;
  idFornecedor: number;
  idFluxo?: number;
  idDespesa?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  isPersisted?: boolean;
  status?: "idle" | "loading" | "ready" | "error";
}
