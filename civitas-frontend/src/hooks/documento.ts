import type DocumentoDTO from "@/models/documento";
import { GenericService } from "./generic";

export type LegacyDocumentoLookupResult =
  | { status: "found"; documento: DocumentoDTO }
  | { status: "not-found" }
  | { status: "ambiguous"; total: number };

const digitsOnly = (value: unknown): string => String(value ?? "").replace(/\D/g, "");

export const normalizeDocumentoForUi = (documento: DocumentoDTO): DocumentoDTO => ({
  ...documento,
  digitalizacao: typeof documento.digitalizacao === "string" ? documento.digitalizacao : "",
  fileName: documento.fileName ?? `documento-${documento.numeroDocumento || documento.idDocumento}.pdf`,
  fileType: documento.fileType ?? "application/pdf",
  status: "ready",
  isPersisted: true,
});

export class DocumentoService extends GenericService<DocumentoDTO> {
  constructor() {
    super("documentos");
  }

  async getDocumentoDataById(idDocumento: number): Promise<DocumentoDTO | null> {
    const documento = await this.getByIdData(idDocumento);
    return documento ? normalizeDocumentoForUi(documento) : null;
  }

  async findUniqueLegacyDocumentoByNumeroFornecedor(
    numeroDocumento: unknown,
    idFornecedor: unknown,
  ): Promise<LegacyDocumentoLookupResult> {
    const numero = Number(digitsOnly(numeroDocumento));
    const fornecedor = Number(idFornecedor);

    if (!Number.isFinite(numero) || numero <= 0 || !Number.isFinite(fornecedor) || fornecedor <= 0) {
      return { status: "not-found" };
    }

    // Fallback legado e temporario: o backend antigo nao expoe um vinculo real
    // entre despesa e documento, apenas numeroDocumento + idFornecedor.
    // Nunca escolha arbitrariamente quando a chave retorna duplicidade.
    const pageSize = 100;
    let currentPage = 1;
    let totalPages = 1;
    const matches: DocumentoDTO[] = [];

    while (currentPage <= totalPages && matches.length < 2) {
      const page = await this.getPage({ page: currentPage, size: pageSize });
      page.items.forEach((documento) => {
        if (Number(documento.numeroDocumento) === numero && Number(documento.idFornecedor) === fornecedor) {
          matches.push(normalizeDocumentoForUi(documento));
        }
      });

      if (page.totalPages <= 0) {
        break;
      }

      totalPages = page.totalPages;
      currentPage += 1;
    }

    if (matches.length === 1) {
      return { status: "found", documento: matches[0] };
    }

    if (matches.length > 1) {
      return { status: "ambiguous", total: matches.length };
    }

    return { status: "not-found" };
  }
}

export const documentoService = new DocumentoService();
