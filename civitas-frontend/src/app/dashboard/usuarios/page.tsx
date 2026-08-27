import type { PaginatedResult } from "@/hooks/generic";
import { usuarioService } from "@/hooks/usuario";
import type UsuarioDTO from "@/models/usuario";
import UsuariosPageClient from "./_components/UsuariosPageClient";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_QUERY = {
  page: 1,
  size: 10,
};

const emptyPage: PaginatedResult<UsuarioDTO> = {
  items: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: DEFAULT_PAGE_QUERY.page,
  pageSize: DEFAULT_PAGE_QUERY.size,
};

export default async function Page() {
  try {
    const initialPage = await usuarioService.getPage(DEFAULT_PAGE_QUERY);
    return <UsuariosPageClient initialPage={initialPage} />;
  } catch (error) {
    console.error("Erro ao carregar usuarios no servidor:", error);

    return <UsuariosPageClient initialPage={emptyPage} initialError="Nao foi possivel carregar usuarios." />;
  }
}
