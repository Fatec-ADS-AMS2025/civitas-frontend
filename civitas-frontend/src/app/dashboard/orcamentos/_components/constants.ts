import type { FieldConfig } from "@/components/Table/searchbar";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

export const novoOrcamento = {
  idOrcamento: 0,
  anoOrcamento: "",
  valorOrcamento: "",
  idInstituicao: "",
  idTipoDespesa: "",
  situacao: 1,
};

export const columns = [
  { id: "idOrcamento", label: "ID Orcamento" },
  { id: "anoOrcamento", label: "Ano" },
  { id: "valorOrcamento", label: "Valor" },
  { id: "instituicaoLabel", label: "Instituicao" },
  { id: "tipoDespesaLabel", label: "Tipo de Despesa" },
];

export const buildCampos = (
  instituicaoOptions: FieldConfig["options"],
  tipoDespesaOptions: FieldConfig["options"]
): FieldConfig[] => [
  {
    key: "anoOrcamento",
    placeholder: "Ano",
    local: "principal",
  },
  {
    key: "valorOrcamento",
    placeholder: "Valor",
    local: "principal",
  },
  {
    key: "idInstituicao",
    placeholder: "Instituicao",
    local: "filtro",
    type: "select",
    options: instituicaoOptions,
  },
  {
    key: "idTipoDespesa",
    placeholder: "Tipo de Despesa",
    local: "filtro",
    type: "select",
    options: tipoDespesaOptions,
  },
];

export const buildFormFields = (
  instituicaoOptions: any,
  tipoDespesaOptions: any
): ModalFieldConfig[] => [
  { key: "idOrcamento", hidden: true },

  {
    key: "anoOrcamento",
    label: "Ano",
    required: true,
    type: "number",
  },

  {
    key: "valorOrcamento",
    label: "Valor",
    required: true,
    type: "number",
  },

  {
    key: "idInstituicao",
    label: "Instituicao",
    type: "select",
    required: true,
    options: instituicaoOptions,
  },

  {
    key: "idTipoDespesa",
    label: "Tipo de Despesa",
    type: "select",
    required: true,
    options: tipoDespesaOptions,
  },
];