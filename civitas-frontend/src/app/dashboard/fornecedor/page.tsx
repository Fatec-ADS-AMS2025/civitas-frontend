import type { PaginatedResult } from "@/hooks/generic";
import { fornecedorService } from "@/hooks/fornecedor";
import type FornecedorDTO from "@/models/fornecedor";
import FornecedorPageClient from "./_components/FornecedorPageClient";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_QUERY = {
  page: 1,
  size: 20,
};

const emptyPage: PaginatedResult<FornecedorDTO> = {
  items: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: DEFAULT_PAGE_QUERY.page,
  pageSize: DEFAULT_PAGE_QUERY.size,
};

export default async function Page() {
  try {
    const initialPage = await fornecedorService.getPage(DEFAULT_PAGE_QUERY);
    return <FornecedorPageClient initialPage={initialPage} />;
  } catch (error) {
    console.error("Erro ao carregar fornecedores no servidor:", error);

    return (
      <FornecedorPageClient
        initialPage={emptyPage}
        initialError="Nao foi possivel carregar os fornecedores. Verifique o backend e tente novamente."
      />
    );
  }
}
