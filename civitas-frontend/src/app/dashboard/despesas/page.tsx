import DespesasPageClient from "./_components/DespesasPageClient";
import { loadDespesasPageData } from "./despesas-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const initialData = await loadDespesasPageData();
    return <DespesasPageClient initialData={initialData} />;
  } catch (error) {
    console.error("Erro ao carregar despesas no servidor:", error);

    return <DespesasPageClient initialError="Nao foi possivel carregar os dados de despesas." />;
  }
}
