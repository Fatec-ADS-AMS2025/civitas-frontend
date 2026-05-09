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

export const novaSecretaria = {
  idSecretaria: 0,
  situacao: SITUACAO_ATIVO,
  descricao: "",
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  nomeRazaoSocial: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

export const columns = [
  { id: "idSecretaria", label: "ID Secretaria" },
  { id: "descricao", label: "Descricao" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const camposConst: FieldConfig[] = [
  {
    key: "descricao",
    placeholder: "Descricao",
    local: "principal",
  },

  {
    key: "cnpj",
    placeholder: "CNPJ",
    local: "principal",
  },

  {
    key: "telefone",
    placeholder: "Telefone",
    local: "filtro",
  },

  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },

  {
    key: "cidade",
    placeholder: "Cidade",
    local: "filtro",
  },
];

export const secretariaFormFields: ModalFieldConfig[] = [
  { key: "idSecretaria", hidden: true },

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
    key: "descricao",
    label: "Descricao",
    required: true,
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
      10
    ),
  },

  {
    key: "bairro",
    label: "Bairro",
    required: true,
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
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options:
      SITUACAO_OPTIONS,
  },
];