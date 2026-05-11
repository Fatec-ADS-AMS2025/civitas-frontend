import { GenericService } from "./generic";
import DocumentoDTO from "@/models/documento";

export class DocumentoService extends GenericService<DocumentoDTO> {
  constructor() {
    super("documentos");
  }

  async getAllDocumentsData(): Promise<DocumentoDTO[]> {
    const pageSize = 100;
    let currentPage = 1;
    let totalPages = 1;
    const items: DocumentoDTO[] = [];

    while (currentPage <= totalPages) {
      const page = await this.getPage({ page: currentPage, size: pageSize });
      items.push(...page.items);

      if (page.totalPages <= 0) {
        break;
      }

      totalPages = page.totalPages;
      currentPage += 1;
    }

    return items;
  }
}

export const documentoService = new DocumentoService();
