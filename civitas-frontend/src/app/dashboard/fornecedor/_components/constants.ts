import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { FieldConfig } from "@/components/Table/searchbar";

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

import type { ListQuery } from "@/hooks/generic";

export const DEFAULT_PAGE_QUERY: Required<
  Pick<ListQuery, "page" | "size">
> = {
  page: 1,
  size: 20,
};

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
];

export const novoFornecedor = {
  idFornecedor: 0,
  nomeFantasia: "",
  situacao: SITUACAO_ATIVO,
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

export const columns = [
  { id: "idFornecedor", label: "ID Fornecedor" },
  { id: "nomeFantasia", label: "Nome Fantasia" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

export const fornecedorFormFields: ModalFieldConfig[] = [
  { key: "idFornecedor", hidden: true },

  {
    key: "nomeFantasia",
    label: "Nome Fantasia",
    placeholder: "Nome fantasia do fornecedor",
    required: true,
  },

  {
    key: "nome",
    label: "Razao Social / Nome",
    placeholder: "Nome ou razao social do fornecedor",
    required: true,
  },

  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
    validate: validateDigitsLength("CNPJ", 14),
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
    validate: validateMaxLength("Numero", 10),
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
    validate: validateDigitsLength("CEP", 8),
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
    validate: composeValidators(
      validateUfCode(),
      validateMaxLength("Estado", 2)
    ),
  },

  {
    key: "telefone",
    label: "Telefone",
    type: "tel",
    required: true,
  },

  {
    key: "email",
    label: "E-mail",
    type: "email",
    required: true,
  },

  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];