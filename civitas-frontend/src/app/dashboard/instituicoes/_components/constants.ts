import type { FieldConfig } from "@/components/Table/searchbar";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

import {
  composeValidators,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";

import {
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";

export const novaInstituicao = {
  id: 0,
  nome: "",
  cnpj: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  nomeRazaoSocial: "",
  situacao: SITUACAO_ATIVO,
  idTipoInstituicao: "",
  idSecretaria: "",
};

export const columns = [
  { id: "nome", label: "Nome" },
  { id: "nomeRazaoSocial", label: "Razao Social" },
  { id: "cnpj", label: "CNPJ" },
  {
    id: "tipoInstituicaoLabel",
    label: "Tipo de Instituicao",
  },
  {
    id: "secretariaLabel",
    label: "Secretaria",
  },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const buildInstituicaoCampos = (
  secretariaOptions: FieldConfig["options"],
  tipoInstituicaoOptions: FieldConfig["options"]
): FieldConfig[] => [
  {
    key: "nome",
    placeholder: "Nome",
    local: "principal",
  },

  {
    key: "cnpj",
    placeholder: "CNPJ",
    local: "principal",
  },

  {
    key: "idTipoInstituicao",
    placeholder: "Tipo de Instituicao",
    local: "filtro",
    type: "select",
    options: tipoInstituicaoOptions,
  },

  {
    key: "idSecretaria",
    placeholder: "Secretaria",
    local: "filtro",
    type: "select",
    options: secretariaOptions,
  },

  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },
];

export const buildInstituicaoFormFields = (
  secretariaOptions: any,
  tipoInstituicaoOptions: any
): ModalFieldConfig[] => [
  { key: "id", hidden: true },

  {
    key: "nome",
    label: "Nome",
    required: true,
  },

  {
    key: "nomeRazaoSocial",
    label: "Razao Social",
    required: true,
  },

  {
    key: "cnpj",
    label: "CNPJ",
    required: true,
    validate: validateDigitsLength(
      "CNPJ",
      14
    ),
  },

  {
    key: "cep",
    label: "CEP",
    required: true,
    validate: validateDigitsLength(
      "CEP",
      8
    ),
  },

  {
    key: "logradouro",
    label: "Logradouro",
    required: true,
  },

  {
    key: "numero",
    label: "Numero",
    required: true,
    validate: validateMaxLength(
      "Numero",
      4
    ),
  },

  {
    key: "bairro",
    label: "Bairro",
    required: true,
  },

  {
    key: "cidade",
    label: "Cidade",
    required: true,
  },

  {
    key: "estado",
    label: "Estado",
    required: true,
    validate:
      composeValidators(
        validateUfCode(),
        validateMaxLength(
          "Estado",
          2
        )
      ),
  },

  {
    key: "telefone",
    label: "Telefone",
    required: true,
  },

  {
    key: "email",
    label: "E-mail",
    required: true,
  },

  {
    key: "idTipoInstituicao",
    label: "Tipo de Instituicao",
    type: "select",
    required: true,
    options:
      tipoInstituicaoOptions,
  },

  {
    key: "idSecretaria",
    label: "Secretaria",
    type: "select",
    required: true,
    options:
      secretariaOptions,
  },

  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options:
      SITUACAO_OPTIONS,
  },
];