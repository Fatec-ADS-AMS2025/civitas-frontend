import { normalizeDateInput, toTrimmedText } from "@/global/formPayload";
import { filterActiveRecords } from "@/global/softDelete";
import type DespesaDTO from "@/models/despesa";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type TipoDespesaDTO from "@/models/tipoDespesa";

const STATUS_LABELS: Record<number, string> = {
  1: "A pagar",
  2: "Paga",
  3: "Atrasada",
};

const SEM_CODIGO_LABEL = "Sem codigo informado";
const SEM_SECRETARIA_LABEL = "Sem secretaria vinculada";

export type FinanceDespesaRelacionada = {
  id: number;
  registro: string;
  codigo: string;
  codigoNormalizado: string;
  numeroDocumento: string;
  uc: string;
  descricao: string;
  categoria: string;
  valor: number;
  valorFormatado: string;
  dataReferencia: string;
  dataReferenciaFormatada: string;
  dataEmissao: string;
  dataVencimento: string;
  status: number;
  statusLabel: string;
  idInstituicao: number | null;
  instituicaoNome: string;
  idSecretaria: number | null;
  secretariaNome: string;
  raw: DespesaDTO;
};

export type FinanceCodigoResumo = {
  codigo: string;
  codigoNormalizado: string;
  quantidadeDespesas: number;
  quantidadeInstituicoes: number;
  quantidadeSecretarias: number;
  totalGastos: number;
  totalGastosFormatado: string;
  ultimaReferencia: string;
  ultimaReferenciaFormatada: string;
  despesas: FinanceDespesaRelacionada[];
  instituicoes: string[];
  secretarias: string[];
};

export type FinanceInstituicaoResumo = {
  id: number;
  nome: string;
  secretariaId: number | null;
  secretariaNome: string;
  tipoInstituicaoId: number | null;
  tipoInstituicaoNome: string;
  totalGastos: number;
  totalGastosFormatado: string;
  totalOrcamentos: number;
  totalOrcamentosFormatado: string;
  saldo: number;
  saldoFormatado: string;
  quantidadeDespesas: number;
  quantidadeCodigos: number;
  despesas: FinanceDespesaRelacionada[];
  codigos: FinanceCodigoResumo[];
  raw: InstituicaoDTO;
};

export type FinanceSecretariaResumo = {
  id: number;
  nome: string;
  quantidadeInstituicoes: number;
  quantidadeInstituicoesComGastos: number;
  quantidadeDespesas: number;
  quantidadeCodigos: number;
  totalGastos: number;
  totalGastosFormatado: string;
  totalOrcamentos: number;
  totalOrcamentosFormatado: string;
  saldo: number;
  saldoFormatado: string;
  instituicoes: FinanceInstituicaoResumo[];
  despesas: FinanceDespesaRelacionada[];
  codigos: FinanceCodigoResumo[];
  raw: SecretariaDTO;
};

export type FinanceRelations = {
  despesas: FinanceDespesaRelacionada[];
  secretarias: FinanceSecretariaResumo[];
  instituicoes: FinanceInstituicaoResumo[];
  codigos: FinanceCodigoResumo[];
};

type BuildFinanceRelationsInput = {
  despesas: DespesaDTO[];
  instituicoes: InstituicaoDTO[];
  secretarias: SecretariaDTO[];
  orcamentos?: OrcamentoDTO[];
  tiposDespesa?: TipoDespesaDTO[];
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const normalizeTextKey = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const toDateTimestamp = (value?: string): number => {
  const normalizedValue = normalizeDateInput(value);
  if (!normalizedValue) {
    return Number.NaN;
  }

  const [year, month, day] = normalizedValue.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
};

export const formatDateLabel = (value?: string): string => {
  const timestamp = toDateTimestamp(value);
  if (Number.isNaN(timestamp)) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
};

const getDespesaStatus = (despesa: DespesaDTO): number => {
  const resolvedStatus = Number(despesa.status ?? despesa.situacao ?? 0);
  return Number.isFinite(resolvedStatus) ? resolvedStatus : 0;
};

const getDespesaStatusLabel = (status: number): string => {
  return STATUS_LABELS[status] ?? "Nao informado";
};

const getDespesaValor = (despesa: DespesaDTO): number => {
  const resolvedValue = Number(
    despesa.valorPago ?? despesa.valor ?? despesa.valorPrevisto ?? despesa.consumoPrevisto ?? 0,
  );
  return Number.isFinite(resolvedValue) ? resolvedValue : 0;
};

const getDespesaDate = (despesa: DespesaDTO): string => {
  return (
    normalizeDateInput(despesa.dataVencimento) ??
    normalizeDateInput(despesa.dataEmissao) ??
    normalizeDateInput(despesa.dataEmicao) ??
    normalizeDateInput(despesa.data) ??
    ""
  );
};

const buildCodigoResumo = (despesas: FinanceDespesaRelacionada[]): FinanceCodigoResumo[] => {
  const grouped = new Map<string, FinanceDespesaRelacionada[]>();

  despesas.forEach((despesa) => {
    if (!despesa.codigoNormalizado) {
      return;
    }

    const current = grouped.get(despesa.codigoNormalizado) ?? [];
    current.push(despesa);
    grouped.set(despesa.codigoNormalizado, current);
  });

  return Array.from(grouped.entries())
    .map(([codigoNormalizado, groupedDespesas]) => {
      const orderedDespesas = [...groupedDespesas].sort((current, next) => {
        const nextTimestamp = toDateTimestamp(next.dataReferencia);
        const currentTimestamp = toDateTimestamp(current.dataReferencia);

        if (Number.isNaN(nextTimestamp) && Number.isNaN(currentTimestamp)) {
          return next.id - current.id;
        }

        if (Number.isNaN(nextTimestamp)) return -1;
        if (Number.isNaN(currentTimestamp)) return 1;

        if (nextTimestamp !== currentTimestamp) {
          return nextTimestamp - currentTimestamp;
        }

        return next.id - current.id;
      });

      const totalGastos = orderedDespesas.reduce((accumulator, item) => accumulator + item.valor, 0);
      const instituicoes = Array.from(
        new Set(orderedDespesas.map((item) => item.instituicaoNome).filter((value) => value.trim().length > 0)),
      );
      const secretarias = Array.from(
        new Set(orderedDespesas.map((item) => item.secretariaNome).filter((value) => value.trim().length > 0)),
      );
      const ultimaReferencia = orderedDespesas[0]?.dataReferencia ?? "";

      return {
        codigo: orderedDespesas[0]?.codigo ?? SEM_CODIGO_LABEL,
        codigoNormalizado,
        quantidadeDespesas: orderedDespesas.length,
        quantidadeInstituicoes: instituicoes.length,
        quantidadeSecretarias: secretarias.length,
        totalGastos,
        totalGastosFormatado: formatCurrency(totalGastos),
        ultimaReferencia,
        ultimaReferenciaFormatada: formatDateLabel(ultimaReferencia),
        despesas: orderedDespesas,
        instituicoes,
        secretarias,
      };
    })
    .sort((current, next) => {
      if (next.totalGastos !== current.totalGastos) {
        return next.totalGastos - current.totalGastos;
      }

      return next.quantidadeDespesas - current.quantidadeDespesas;
    });
};

export const buildFinanceRelations = ({
  despesas,
  instituicoes,
  secretarias,
  orcamentos = [],
  tiposDespesa = [],
}: BuildFinanceRelationsInput): FinanceRelations => {
  const activeDespesas = filterActiveRecords(despesas);
  const activeOrcamentos = filterActiveRecords(orcamentos);
  const secretariaMap = new Map(secretarias.map((secretaria) => [secretaria.idSecretaria, secretaria]));
  const instituicaoMap = new Map(instituicoes.map((instituicao) => [instituicao.id, instituicao]));
  const tipoDespesaMap = new Map(tiposDespesa.map((tipoDespesa) => [tipoDespesa.id, tipoDespesa]));

  const despesasRelacionadas = activeDespesas
    .map<FinanceDespesaRelacionada>((despesa) => {
      const instituicaoId = despesa.idInstituicao ?? null;
      const instituicao = instituicaoId ? instituicaoMap.get(instituicaoId) : undefined;
      const secretariaId = instituicao?.idSecretaria ?? null;
      const secretaria = secretariaId ? secretariaMap.get(secretariaId) : undefined;
      const tipoDespesa = despesa.idTipoDespesa ? tipoDespesaMap.get(despesa.idTipoDespesa) : undefined;
      const codigo = toTrimmedText(despesa.codigo);
      const valor = getDespesaValor(despesa);
      const dataReferencia = getDespesaDate(despesa);
      const status = getDespesaStatus(despesa);

      return {
        id: despesa.id,
        registro: `#${String(despesa.id).padStart(3, "0")}`,
        codigo: codigo || SEM_CODIGO_LABEL,
        codigoNormalizado: codigo ? normalizeTextKey(codigo) : "",
        numeroDocumento: toTrimmedText(despesa.numeroDocumento),
        uc: toTrimmedText(despesa.uc),
        descricao:
          toTrimmedText(despesa.descricao) || toTrimmedText(despesa.numeroDocumento) || `Despesa ${despesa.id}`,
        categoria: tipoDespesa?.descricao || toTrimmedText(despesa.categoria) || "Categoria nao informada",
        valor,
        valorFormatado: formatCurrency(valor),
        dataReferencia,
        dataReferenciaFormatada: formatDateLabel(dataReferencia),
        dataEmissao: normalizeDateInput(despesa.dataEmissao) ?? normalizeDateInput(despesa.dataEmicao) ?? "",
        dataVencimento: normalizeDateInput(despesa.dataVencimento) ?? "",
        status,
        statusLabel: getDespesaStatusLabel(status),
        idInstituicao: instituicao?.id ?? null,
        instituicaoNome: instituicao?.nome ?? "Instituicao nao encontrada",
        idSecretaria: secretaria?.idSecretaria ?? null,
        secretariaNome: secretaria?.nome ?? SEM_SECRETARIA_LABEL,
        raw: despesa,
      };
    })
    .sort((current, next) => {
      const nextTimestamp = toDateTimestamp(next.dataReferencia);
      const currentTimestamp = toDateTimestamp(current.dataReferencia);

      if (Number.isNaN(nextTimestamp) && Number.isNaN(currentTimestamp)) {
        return next.id - current.id;
      }

      if (Number.isNaN(nextTimestamp)) return -1;
      if (Number.isNaN(currentTimestamp)) return 1;

      if (nextTimestamp !== currentTimestamp) {
        return nextTimestamp - currentTimestamp;
      }

      return next.id - current.id;
    });

  const instituicoesResumo = instituicoes
    .map<FinanceInstituicaoResumo>((instituicao) => {
      const despesasDaInstituicao = despesasRelacionadas.filter((despesa) => despesa.idInstituicao === instituicao.id);
      const totalGastos = despesasDaInstituicao.reduce((accumulator, item) => accumulator + item.valor, 0);
      const totalOrcamentos = activeOrcamentos
        .filter((orcamento) => orcamento.idInstituicao === instituicao.id)
        .reduce((accumulator, item) => accumulator + Number(item.valorOrcamento ?? item.valor ?? 0), 0);
      const codigos = buildCodigoResumo(despesasDaInstituicao);
      const secretaria = instituicao.idSecretaria ? secretariaMap.get(instituicao.idSecretaria) : undefined;

      return {
        id: instituicao.id,
        nome: instituicao.nome,
        secretariaId: secretaria?.idSecretaria ?? null,
        secretariaNome: secretaria?.nome ?? SEM_SECRETARIA_LABEL,
        tipoInstituicaoId: instituicao.idTipoInstituicao ?? null,
        tipoInstituicaoNome: "",
        totalGastos,
        totalGastosFormatado: formatCurrency(totalGastos),
        totalOrcamentos,
        totalOrcamentosFormatado: formatCurrency(totalOrcamentos),
        saldo: totalOrcamentos - totalGastos,
        saldoFormatado: formatCurrency(totalOrcamentos - totalGastos),
        quantidadeDespesas: despesasDaInstituicao.length,
        quantidadeCodigos: codigos.length,
        despesas: despesasDaInstituicao,
        codigos,
        raw: instituicao,
      };
    })
    .sort((current, next) => {
      if (next.totalGastos !== current.totalGastos) {
        return next.totalGastos - current.totalGastos;
      }

      return current.nome.localeCompare(next.nome, "pt-BR");
    });

  const secretariasResumo = secretarias
    .map<FinanceSecretariaResumo>((secretaria) => {
      const instituicoesDaSecretaria = instituicoesResumo.filter(
        (instituicao) => instituicao.secretariaId === secretaria.idSecretaria,
      );
      const despesasDaSecretaria = despesasRelacionadas.filter(
        (despesa) => despesa.idSecretaria === secretaria.idSecretaria,
      );
      const totalGastos = instituicoesDaSecretaria.reduce((accumulator, item) => accumulator + item.totalGastos, 0);
      const totalOrcamentos = instituicoesDaSecretaria.reduce(
        (accumulator, item) => accumulator + item.totalOrcamentos,
        0,
      );
      const codigos = buildCodigoResumo(despesasDaSecretaria);

      return {
        id: secretaria.idSecretaria,
        nome: secretaria.nome,
        quantidadeInstituicoes: instituicoesDaSecretaria.length,
        quantidadeInstituicoesComGastos: instituicoesDaSecretaria.filter(
          (instituicao) => instituicao.quantidadeDespesas > 0,
        ).length,
        quantidadeDespesas: despesasDaSecretaria.length,
        quantidadeCodigos: codigos.length,
        totalGastos,
        totalGastosFormatado: formatCurrency(totalGastos),
        totalOrcamentos,
        totalOrcamentosFormatado: formatCurrency(totalOrcamentos),
        saldo: totalOrcamentos - totalGastos,
        saldoFormatado: formatCurrency(totalOrcamentos - totalGastos),
        instituicoes: instituicoesDaSecretaria,
        despesas: despesasDaSecretaria,
        codigos,
        raw: secretaria,
      };
    })
    .sort((current, next) => {
      if (next.totalGastos !== current.totalGastos) {
        return next.totalGastos - current.totalGastos;
      }

      return current.nome.localeCompare(next.nome, "pt-BR");
    });

  return {
    despesas: despesasRelacionadas,
    secretarias: secretariasResumo,
    instituicoes: instituicoesResumo,
    codigos: buildCodigoResumo(despesasRelacionadas),
  };
};
