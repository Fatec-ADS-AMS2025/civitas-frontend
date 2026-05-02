import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type { FieldConfig } from "@/components/Table/searchbar";
import { SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";
import type { ConfigDefinition, ConfigKind } from "./configuracoes.types";

export const CONFIG_FORM_HIDDEN_FIELDS = [
  "id",
  "situacaoLabel",
  "solicitaUcLabel",
  "unidadeMedidaLabel",
];

export const CONFIG_SELECTOR_ITEMS: { key: ConfigKind; label: string }[] = [
  { key: "tipoInstituicao", label: "Tipo de Instituicao" },
  { key: "tipoDespesa", label: "Tipo de Despesa" },
  { key: "tipoCodigo", label: "Tipo de Codigo" },
  { key: "unidadeMedida", label: "Unidade de Medida" },
];

export const SOLICITA_UC_OPTIONS = [
  { value: 1, label: "Sim" },
  { value: 2, label: "Nao" },
];

const statusSearchOptions: FieldConfig["options"] = [
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
];

const tipoInstituicaoColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "situacaoLabel", label: "Situacao" },
];

const tipoCodigoColumns = [
  { id: "id", label: "ID" },
  { id: "nome", label: "Nome" },
  { id: "descricao", label: "Descricao" },
];

const tipoDespesaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "solicitaUcLabel", label: "Solicita UC" },
  { id: "unidadeMedidaLabel", label: "Unidade de Medida" },
  { id: "situacaoLabel", label: "Situacao" },
];

const unidadeMedidaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "abreviatura", label: "Abreviatura" },
  { id: "situacaoLabel", label: "Situacao" },
];

const buildStatusSearchField = (): FieldConfig => ({
  key: "situacaoLabel",
  placeholder: "Situacao",
  local: "filtro",
  type: "select",
  options: statusSearchOptions,
});

const buildSituacaoField = (): ModalFieldConfig => ({
  key: "situacao",
  label: "Situacao",
  type: "select",
  options: SITUACAO_OPTIONS,
  required: true,
});

export const CONFIG_DEFINITIONS: Record<ConfigKind, ConfigDefinition> = {
  tipoCodigo: {
    key: "tipoCodigo",
    label: "Tipo de Codigo",
    columns: tipoCodigoColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "nome",
        label: "Nome",
        placeholder: "Informe o nome",
        required: true,
      },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        type: "textarea",
        required: true,
      },
    ],
    buildSearchFields: () => [
      { key: "nome", placeholder: "Nome", local: "principal" },
      { key: "descricao", placeholder: "Descricao", local: "filtro" },
    ],
    emptyModel: {
      id: 0,
      nome: "",
      descricao: "",
    },
  },
  tipoInstituicao: {
    key: "tipoInstituicao",
    label: "Tipo de Instituicao",
    columns: tipoInstituicaoColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        required: true,
      },
      buildSituacaoField(),
    ],
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      buildStatusSearchField(),
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      situacao: SITUACAO_ATIVO,
    },
  },
  tipoDespesa: {
    key: "tipoDespesa",
    label: "Tipo de Despesa",
    columns: tipoDespesaColumns,
    buildFields: (unidades, tipoCodigos) => {
      const hasTipoCodigoOptions = tipoCodigos.length > 0;

      return [
        { key: "id", hidden: true },
        {
          key: "descricao",
          label: "Descricao",
          placeholder: "Informe a descricao",
          required: true,
        },
        {
          key: "solicitaUc",
          label: "Solicita UC",
          type: "select",
          options: SOLICITA_UC_OPTIONS,
          required: true,
        },
        {
          key: "idTipoCodigo",
          label: "Tipo de Codigo",
          placeholder: "Selecione o tipo de codigo",
          type: "select",
          options: tipoCodigos.map((item) => ({
            value: item.id,
            label: item.nome,
          })),
          hidden: !hasTipoCodigoOptions,
          required: hasTipoCodigoOptions,
        },
        {
          key: "idUnidadeMedida",
          label: "Unidade de Medida",
          placeholder: "Selecione a unidade de medida",
          type: "select",
          options: unidades.map((item) => ({
            value: item.id,
            label:
              item.situacao === SITUACAO_ATIVO
                ? item.descricao
                : `${item.descricao} (Inativo)`,
          })),
          required: true,
        },
        buildSituacaoField(),
      ];
    },
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      buildStatusSearchField(),
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      solicitaUc: 1,
      idTipoCodigo: "",
      idUnidadeMedida: "",
      situacao: SITUACAO_ATIVO,
    },
  },
  unidadeMedida: {
    key: "unidadeMedida",
    label: "Unidade de Medida",
    columns: unidadeMedidaColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        required: true,
      },
      {
        key: "abreviatura",
        label: "Abreviatura",
        placeholder: "Ex.: kWh",
        required: true,
      },
      buildSituacaoField(),
    ],
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      buildStatusSearchField(),
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      abreviatura: "",
      situacao: SITUACAO_ATIVO,
    },
  },
};
