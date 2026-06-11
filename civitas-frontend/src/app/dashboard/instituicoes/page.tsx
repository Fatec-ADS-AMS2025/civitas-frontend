import { fetchInstituicaoPageData } from "./_utils/instituicoes-data";
import type { InstituicaoPageData } from "./_types";
import InstituicoesPageClient from "./_components/InstituicoesPageClient";

export const dynamic = "force-dynamic";

const emptyData: InstituicaoPageData = {
  instituicoes: [],
  secretarias: [],
  tiposInstituicao: [],
  despesas: [],
  orcamentos: [],
};

export default async function Page() {
  try {
    const initialData = await fetchInstituicaoPageData();
    return <InstituicoesPageClient initialData={initialData} />;
  } catch (error) {
    console.error("Erro ao carregar instituicoes no servidor:", error);

    return (
      <InstituicoesPageClient
        initialData={emptyData}
        initialError="Nao foi possivel carregar as instituicoes. Verifique o backend e tente novamente."
      />
    );
  }
}
