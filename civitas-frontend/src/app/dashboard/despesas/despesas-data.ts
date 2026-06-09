import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";
import { usuarioService } from "@/hooks/usuario";
import type { DashboardData } from "@/hooks/useDespesasDashboard";
import type DespesaDTO from "@/models/despesa";

const isHttpNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
};

const isHttpBadRequestError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 400");
};

const logOptionalDashboardWarning = (message: string, error: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, error);
  }
};

const mergeUniqueById = (despesas: DespesaDTO[]): DespesaDTO[] => {
  return Array.from(new Map(despesas.map((despesa) => [despesa.id, despesa])).values());
};

const safeLoadInactiveDespesas = async (): Promise<DespesaDTO[]> => {
  try {
    return (await despesaService.getInactiveOptional()) ?? [];
  } catch (error) {
    if (!isHttpNotFoundError(error) && !isHttpBadRequestError(error)) {
      logOptionalDashboardWarning("Erro ao carregar despesas inativas:", error);
    }

    return [];
  }
};

export const loadDespesasPageData = async (): Promise<DashboardData> => {
  const [
    despesasTodas,
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    unidadesConsumidorasAtivas,
    unidadesMedida,
    usuarios,
    unidadesConsumidorasAll,
  ] = await Promise.all([
    despesaService.getAllStatusData(),
    tipoCodigoService.getAllOptional(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    secretariaService.getAllData(),
    fornecedorService.getAllData(),
    unidadeConsumidoraService.getAllActiveData(),
    unidadeMedidaService.getAllData(),
    usuarioService.getAllData(),
    unidadeConsumidoraService.getAllData(),
  ]);

  return {
    despesas: mergeUniqueById([...(despesasTodas ?? []), ...(await safeLoadInactiveDespesas())]),
    tipoCodigos: tipoCodigos ?? [],
    tiposDespesa: tiposDespesa ?? [],
    orcamentos: orcamentos ?? [],
    instituicoes: instituicoes ?? [],
    secretarias: secretarias ?? [],
    fornecedores: fornecedores ?? [],
    unidadesConsumidoras: unidadesConsumidorasAtivas ?? unidadesConsumidorasAll ?? [],
    unidadesMedida: unidadesMedida ?? [],
    usuarios: usuarios ?? [],
  };
};
