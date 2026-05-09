import { GenericService } from "./generic";
import DocumentoDTO from "@/models/documento";

export class DocumentoService extends GenericService<DocumentoDTO> {
  constructor() {
    super("documentos");
  }
}

export const documentoService = new DocumentoService();
