import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type { FieldConfig } from "@/components/Table/searchbar";
import {
  composeValidators,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import { SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";

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

export const secretariaColumns = [
  { id: "idSecretaria", label: "ID Secretaria" },
  { id: "descricao", label: "Descricao" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacaoLabel", label: "Situacao" },
];

export const secretariaSearchFields: FieldConfig[] = [
  { key: "descricao", placeholder: "Descricao", local: "principal" },
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

export const secretariaFormFields: ModalFieldConfig[] = [
  { key: "idSecretaria", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome da secretaria", required: true },
  {
    key: "nomeRazaoSocial",
    label: "Razao Social",
    placeholder: "Razao social da secretaria",
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
    key: "descricao",
    label: "Descricao",
    placeholder: "Descricao da secretaria",
    required: true,
  },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  {
    key: "numero",
    label: "Numero",
    placeholder: "Numero",
    required: true,
    validate: validateMaxLength("Numero", 10),
  },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  {
    key: "cep",
    label: "CEP",
    placeholder: "00000-000",
    required: true,
    validate: validateDigitsLength("CEP", 8),
  },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  {
    key: "estado",
    label: "Estado",
    placeholder: "UF",
    required: true,
    validate: composeValidators(validateUfCode(), validateMaxLength("Estado", 2)),
  },
  {
    key: "telefone",
    label: "Telefone",
    placeholder: "(00) 00000-0000",
    type: "tel",
    required: true,
  },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@secretaria.gov.br",
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
