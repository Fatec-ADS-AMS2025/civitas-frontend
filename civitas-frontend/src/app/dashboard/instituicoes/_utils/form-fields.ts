import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type { FieldConfig } from "@/components/Table/searchbar";
import {
  composeValidators,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import { SITUACAO_OPTIONS } from "@/global/situacao";

export const buildInstituicaoCampos = (
  secretariaOptions: FieldConfig["options"],
  tipoInstituicaoOptions: FieldConfig["options"]
): FieldConfig[] => {
  return [
    { key: "nome", placeholder: "Nome", local: "principal" },
    { key: "cnpj", placeholder: "CNPJ", local: "principal" },
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
};

export const buildInstituicaoFormFields = (
  secretariaOptions: FieldConfig["options"],
  tipoInstituicaoOptions: FieldConfig["options"]
): ModalFieldConfig[] => {
  return [
    { key: "id", hidden: true },
    {
      key: "nome",
      label: "Nome",
      placeholder: "Nome da instituicao",
      required: true,
    },
    {
      key: "nomeRazaoSocial",
      label: "Razao Social",
      placeholder: "Razao social da instituicao",
      required: true,
    },
    {
      key: "cnpj",
      label: "CNPJ",
      placeholder: "00.000.000/0000-00",
      mask: "cnpj",
      required: true,
      validate: validateDigitsLength("CNPJ", 14),
    },
    {
      key: "cep",
      label: "CEP",
      placeholder: "00000-000",
      mask: "cep",
      required: true,
      validate: validateDigitsLength("CEP", 8),
    },
    {
      key: "logradouro",
      label: "Logradouro",
      placeholder: "Rua / Avenida",
      required: true,
    },
    {
      key: "numero",
      label: "Numero",
      placeholder: "Numero",
      required: true,
      validate: validateMaxLength("Numero", 4),
    },
    {
      key: "bairro",
      label: "Bairro",
      placeholder: "Bairro",
      required: true,
    },
    {
      key: "cidade",
      label: "Cidade",
      placeholder: "Cidade",
      required: true,
    },
    {
      key: "estado",
      label: "Estado",
      placeholder: "UF",
      required: true,
      validate: composeValidators(
        validateUfCode(),
        validateMaxLength("Estado", 2)
      ),
    },
    {
      key: "telefone",
      label: "Telefone",
      placeholder: "(00) 00000-0000",
      type: "tel",
      mask: "phone",
      required: true,
    },
    {
      key: "email",
      label: "E-mail",
      placeholder: "email@instituicao.com",
      type: "email",
      required: true,
    },
    {
      key: "idTipoInstituicao",
      label: "Tipo de Instituicao",
      placeholder: "Selecione o tipo de instituicao",
      type: "select",
      required: true,
      options: tipoInstituicaoOptions,
    },
    {
      key: "idSecretaria",
      label: "Secretaria",
      placeholder: "Selecione a secretaria",
      type: "select",
      required: true,
      options: secretariaOptions,
    },
    {
      key: "situacao",
      label: "Situacao",
      type: "select",
      required: true,
      options: SITUACAO_OPTIONS,
    },
  ];
};
