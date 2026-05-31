import type { FieldConfig } from "@/components/Table/searchbar";
import type { FinanceInstituicaoResumo } from "@/lib/financeiro-relations";
import type DespesaDTO from "@/models/despesa";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoInstituicaoDTO from "@/models/tipoInstituicao";

export type Instituicao = InstituicaoDTO;
export type Secretaria = SecretariaDTO;
export type TipoInstituicao = TipoInstituicaoDTO;
export type Despesa = DespesaDTO;
export type Orcamento = OrcamentoDTO;
export type InstituicaoSearchField = FieldConfig;
export type InstituicaoLookupOptions = FieldConfig["options"];

export type InstituicaoRow = Instituicao & {
  situacaoLabel: string;
  secretariaLabel: string;
  tipoInstituicaoLabel: string;
  quantidadeDespesas: number;
  quantidadeCodigos: number;
  totalGastosFormatado: string;
  saldoFormatado: string;
  financeiroResumo?: FinanceInstituicaoResumo;
};

export type InstituicaoPageData = {
  instituicoes: Instituicao[];
  secretarias: Secretaria[];
  tiposInstituicao: TipoInstituicao[];
  despesas: DespesaDTO[];
  orcamentos: OrcamentoDTO[];
};

export type InstituicaoFinanceResumo = FinanceInstituicaoResumo;
