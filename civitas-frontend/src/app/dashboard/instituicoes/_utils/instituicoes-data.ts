import { getSituacaoLabel, SITUACAO_INATIVO } from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import type { FinanceInstituicaoResumo } from "@/lib/financeiro-relations";
import type { Instituicao, InstituicaoPageData, InstituicaoRow, Secretaria, TipoInstituicao } from "../_types";
import { formatCurrency } from "./formatters";

export const buildLookupLabel = (label: string, situacao?: number): string => {
  if (situacao === SITUACAO_INATIVO) {
    return `${label} (Inativo)`;
  }

  return label;
};

export const mapInstituicaoRows = (
  instituicoes: Instituicao[],
  secretarias: Secretaria[],
  tiposInstituicao: TipoInstituicao[],
  financeiros: FinanceInstituicaoResumo[],
): InstituicaoRow[] => {
  const secretariaMap = new Map(secretarias.map((secretaria) => [secretaria.idSecretaria, secretaria.nome]));
  const tipoMap = new Map(tiposInstituicao.map((tipoInstituicao) => [tipoInstituicao.id, tipoInstituicao.descricao]));
  const financeiroMap = new Map(financeiros.map((instituicao) => [instituicao.id, instituicao]));

  return instituicoes.map((instituicao) => {
    const secretariaId = instituicao.idSecretaria;
    const tipoInstituicaoId = instituicao.idTipoInstituicao;
    const resumoFinanceiro = financeiroMap.get(instituicao.id);

    return {
      ...instituicao,
      situacaoLabel: getSituacaoLabel(instituicao.situacao),
      secretariaLabel:
        secretariaId !== undefined
          ? (secretariaMap.get(secretariaId) ?? `Secretaria #${secretariaId}`)
          : "Secretaria nao informada",
      tipoInstituicaoLabel:
        tipoInstituicaoId !== undefined
          ? (tipoMap.get(tipoInstituicaoId) ?? `Tipo #${tipoInstituicaoId}`)
          : "Tipo nao informado",
      quantidadeDespesas: resumoFinanceiro?.quantidadeDespesas ?? 0,
      quantidadeCodigos: resumoFinanceiro?.quantidadeCodigos ?? 0,
      totalGastosFormatado: resumoFinanceiro?.totalGastosFormatado ?? formatCurrency(0),
      saldoFormatado: resumoFinanceiro?.saldoFormatado ?? formatCurrency(0),
      financeiroResumo: resumoFinanceiro,
    };
  });
};

export const fetchInstituicaoPageData = async (): Promise<InstituicaoPageData> => {
  const [instituicoes, secretarias, tiposInstituicao, despesas, orcamentos] = await Promise.all([
    instituicaoService.getAll(),
    secretariaService.getAll(),
    tipoInstituicaoService.getAll(),
    despesaService.getAllStatusData(),
    orcamentoService.getAllData(),
  ]);

  return {
    instituicoes,
    secretarias,
    tiposInstituicao,
    despesas,
    orcamentos,
  };
};
