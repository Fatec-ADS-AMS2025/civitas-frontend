import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import { usuarioService } from "@/hooks/usuario";
import { mergeUniqueById } from "./rows";
import type { DashboardData } from "./types";

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel carregar os dados de despesas.";
};

export const isHttpNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
};

export const isHttpBadRequestError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 400");
};

export const isHttpMethodNotAllowedError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 405");
};

const logOptionalDashboardWarning = (message: string, error: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, error);
  }
};

const safeLoadInactiveDespesas = async () => {
  try {
    return (await despesaService.getInactiveOptional()) ?? [];
  } catch (error) {
    if (!isHttpNotFoundError(error) && !isHttpBadRequestError(error)) {
      logOptionalDashboardWarning("Erro ao carregar despesas inativas:", error);
    }

    return [];
  }
};

export const loadDashboardData = async (): Promise<DashboardData> => {
  const [
    despesasTodas,
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    usuarios,
    unidadesConsumidoras,
  ] = await Promise.all([
    despesaService.getAllStatusData(),
    tipoCodigoService.getAllOptional(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    secretariaService.getAllData(),
    fornecedorService.getAllData(),
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
    usuarios: usuarios ?? [],
    unidadesConsumidoras: unidadesConsumidoras ?? [],
  };
};
