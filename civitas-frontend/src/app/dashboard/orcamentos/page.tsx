import type { PaginatedResult } from "@/hooks/generic";
import { despesaService } from "@/hooks/despesa";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import type DespesaDTO from "@/models/despesa";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import OrcamentosPageClient from "./_components/OrcamentosPageClient";

export const dynamic = "force-dynamic";

type OrcamentoPageData = {
  orcamentos: OrcamentoDTO[];
  despesas: DespesaDTO[];
  instituicoes: InstituicaoDTO[];
  tiposDespesa: TipoDespesaDTO[];
};

const emptyData: OrcamentoPageData = {
  orcamentos: [],
  despesas: [],
  instituicoes: [],
  tiposDespesa: [],
};

const loadDespesasSafely = async (): Promise<DespesaDTO[]> => {
  try {
    return await despesaService.getAllStatusData();
  } catch (error) {
    console.error("Erro ao carregar despesas vinculadas aos orcamentos:", error);
    return [];
  }
};

const fetchOrcamentoPageData = async (): Promise<OrcamentoPageData> => {
  const [orcamentos, despesas, instituicoes, tiposDespesa] = await Promise.all([
    orcamentoService.getAll(),
    loadDespesasSafely(),
    instituicaoService.getAll(),
    tipoDespesaService.getAll(),
  ]);

  return {
    orcamentos,
    despesas,
    instituicoes,
    tiposDespesa,
  };
};

export default async function Page() {
  try {
    const initialData = await fetchOrcamentoPageData();
    return <OrcamentosPageClient initialData={initialData} />;
  } catch (error) {
    console.error("Erro ao carregar orcamentos no servidor:", error);

    return (
      <OrcamentosPageClient
        initialData={emptyData}
        initialError="Nao foi possivel carregar os orcamentos. Verifique o backend e tente novamente."
      />
    );
  }
}
