import { fornecedorService } from "@/hooks/fornecedor";
import type { PaginatedResult } from "@/hooks/generic";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";
import UnidadesConsumidorasPageClient from "./_components/UnidadesConsumidorasPageClient";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_QUERY = {
  page: 1,
  size: 20,
};

type UnidadeConsumidoraLookups = {
  instituicoes: InstituicaoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  secretarias: SecretariaDTO[];
  orcamentos: OrcamentoDTO[];
  fornecedores: FornecedorDTO[];
};

const emptyPage: PaginatedResult<UnidadeConsumidoraDTO> = {
  items: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: DEFAULT_PAGE_QUERY.page,
  pageSize: DEFAULT_PAGE_QUERY.size,
};

const emptyLookups: UnidadeConsumidoraLookups = {
  instituicoes: [],
  tiposDespesa: [],
  secretarias: [],
  orcamentos: [],
  fornecedores: [],
};

const fetchUnidadesConsumidorasPageData = async () => {
  const [page, instituicoes, tiposDespesa, secretarias, orcamentos, fornecedores] =
    await Promise.all([
      unidadeConsumidoraService.getPage(DEFAULT_PAGE_QUERY),
      instituicaoService.getAll(),
      tipoDespesaService.getAll(),
      secretariaService.getAll(),
      orcamentoService.getAll(),
      fornecedorService.getAll(),
    ]);

  return {
    page,
    lookups: {
      instituicoes,
      tiposDespesa,
      secretarias,
      orcamentos,
      fornecedores,
    },
  };
};

export default async function Page() {
  try {
    const initialData = await fetchUnidadesConsumidorasPageData();

    return (
      <UnidadesConsumidorasPageClient
        initialPage={initialData.page}
        initialLookups={initialData.lookups}
      />
    );
  } catch (error) {
    console.error("Erro ao carregar unidades consumidoras no servidor:", error);

    return (
      <UnidadesConsumidorasPageClient
        initialPage={emptyPage}
        initialLookups={emptyLookups}
        initialError="Nao foi possivel carregar as unidades consumidoras. Verifique o backend e tente novamente."
      />
    );
  }
}
