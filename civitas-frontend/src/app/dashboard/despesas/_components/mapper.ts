import { normalizeDateInput } from "@/global/formPayload";
import { EMPTY_DESPESA_FORM } from "./constants";

export const buildDespesaFormObject = (despesa?: any) => {
  if (!despesa) return EMPTY_DESPESA_FORM;

  return {
    id: despesa.id,
    numeroDocumento: despesa.raw.numeroDocumento ?? "",
    idTipoDespesa: despesa.raw.idTipoDespesa ?? "",
    uc: despesa.raw.uc ?? "",
    consumoPrevisto: despesa.raw.consumoPrevisto ?? "",
    dataEmicao: normalizeDateInput(despesa.raw.dataEmicao) ?? "",
    dataVencimento: normalizeDateInput(despesa.raw.dataVencimento) ?? "",
    idInstituicao: despesa.raw.idInstituicao ?? "",
    idOrcamento: despesa.raw.idOrcamento ?? "",
    idFornecedor: despesa.raw.idFornecedor ?? "",
    idUsuario: despesa.raw.idUsuario ?? "",
    situacao: despesa.raw.situacao,
  };
};