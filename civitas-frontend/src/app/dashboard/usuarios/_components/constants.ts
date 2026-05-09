import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

import UsuarioDTO from "@/models/usuario";

import {
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";

import type {
  ListQuery,
} from "@/hooks/generic";

type User = UsuarioDTO;

export const DEFAULT_PAGE_QUERY: Required<
  Pick<ListQuery, "page" | "size">
> = {
  page: 1,
  size: 10,
};

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
];

export const TIPO_USUARIO_OPTIONS = [
  {
    value: 1,
    label: "Visitante",
  },
  {
    value: 2,
    label: "Administrador",
  },
  {
    value: 3,
    label: "Funcionario",
  },
];

export const novoUsuario: User = {
  id: 0,
  cpf: "",
  nome: "",
  rg: "",
  logradouro: "",
  numero: "",
  matricula: "",
  cidade: "",
  estado: "",
  cep: "",
  bairro: "",
  email: "",
  senha: "",
  situacao: SITUACAO_ATIVO,
  tipoUsuario: 1,
};

export const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matricula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "email", label: "E-mail" },
  {
    id: "tipoUsuarioLabel",
    label: "Tipo",
  },
  {
    id: "situacaoLabel",
    label: "Situacao",
  },
];

export const camposConst: FieldConfig[] = [
  {
    key: "nome",
    placeholder: "Nome",
    local: "principal",
  },
];

export const usuarioFormFields:
  ModalFieldConfig[] = [
  {
    key: "id",
    hidden: true,
  },
];