import type DespesaDTO from "@/models/despesa";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import { formatDate, parseDateTimestamp } from "./dates";
import {
  formatCurrency,
  resolveDespesaDate,
  resolveDespesaDescricao,
  resolveDespesaStatus,
  resolveDespesaStatusLabel,
  resolveDespesaValor,
} from "./formatters";
import { SOLICITA_UC_SIM, type DespesaDashboardRow } from "./types";

export const mergeUniqueById = (despesas: DespesaDTO[]): DespesaDTO[] => {
  return Array.from(new Map(despesas.map((despesa) => [despesa.id, despesa])).values());
};

export const buildDespesaRows = (
  despesas: DespesaDTO[],
  tiposDespesaMap: Map<number, TipoDespesaDTO>,
  tipoCodigosMap: Map<number, TipoCodigoDTO>
): DespesaDashboardRow[] => {
  return despesas
    .map((despesa) => {
      const tipoDespesa =
        despesa.idTipoDespesa !== undefined
          ? tiposDespesaMap.get(despesa.idTipoDespesa)
          : undefined;
      const tipoCodigo =
        tipoDespesa?.idTipoCodigo !== undefined
          ? tipoCodigosMap.get(tipoDespesa.idTipoCodigo)
          : undefined;
      const resolvedDate = resolveDespesaDate(despesa);
      const resolvedValue = resolveDespesaValor(despesa);
      const situacao = resolveDespesaStatus(despesa);
      const solicitaUc = tipoDespesa?.solicitaUc === SOLICITA_UC_SIM;

      return {
        id: despesa.id,
        registro: `#${String(despesa.id).padStart(3, "0")}`,
        categoria:
          tipoDespesa?.descricao ??
          despesa.categoria?.trim() ??
          "Categoria nao informada",
        tipoCodigoId: tipoDespesa?.idTipoCodigo ?? null,
        tipoCodigoNome:
          tipoCodigo?.nome?.trim() ||
          tipoCodigo?.descricao?.trim() ||
          "Tipo de codigo nao informado",
        descricao: resolveDespesaDescricao(despesa),
        valor: resolvedValue,
        valorFormatado: formatCurrency(resolvedValue),
        data: resolvedDate,
        dataFormatada: formatDate(resolvedDate),
        situacao,
        situacaoLabel: resolveDespesaStatusLabel(situacao),
        solicitaUc,
        solicitaUcLabel: solicitaUc ? "Sim" : "Nao",
        numeroDocumento: despesa.numeroDocumento ?? "",
        raw: despesa,
      };
    })
    .sort((current, next) => {
      const nextDate = parseDateTimestamp(next.data);
      const currentDate = parseDateTimestamp(current.data);

      if (Number.isNaN(nextDate) && Number.isNaN(currentDate)) {
        return next.id - current.id;
      }

      if (Number.isNaN(nextDate)) return -1;
      if (Number.isNaN(currentDate)) return 1;
      if (nextDate !== currentDate) return nextDate - currentDate;

      return next.id - current.id;
    });
};
