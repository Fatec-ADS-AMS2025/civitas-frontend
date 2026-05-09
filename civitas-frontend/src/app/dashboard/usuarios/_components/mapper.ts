import UsuarioDTO from "@/models/usuario";

import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
} from "@/global/situacao";

import {
  TIPO_USUARIO_OPTIONS,
} from "./constants";

type User = UsuarioDTO;

export type UserRow =
  User & {
    tipoUsuarioLabel: string;
    situacaoLabel: string;
  };

const getTipoUsuarioLabel = (
  value:
    number
    | null
    | undefined,
): string => {

  const item =
    TIPO_USUARIO_OPTIONS.find(
      (option) =>
        option.value === value,
    );

  return (
    item?.label
    ?? "Visitante"
  );
};

export const toNumber = (
  value: unknown,
  fallback: number,
): number => {

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

export const mapUsuarioToRow = (
  api: Partial<User>,
): UserRow => {

  const tipoUsuario =
    toNumber(
      api.tipoUsuario,
      1,
    );

  const situacao =
    toNumber(
      api.situacao,
      SITUACAO_ATIVO,
    );

  return {

    id:
      toNumber(
        api.id,
        0,
      ),

    cpf:
      String(
        api.cpf ?? "",
      ),

    nome:
      String(
        api.nome ?? "",
      ),

    rg:
      String(
        api.rg ?? "",
      ),

    logradouro:
      String(
        api.logradouro ?? "",
      ),

    numero:
      String(
        api.numero ?? "",
      ),

    matricula:
      String(
        api.matricula ?? "",
      ),

    cidade:
      String(
        api.cidade ?? "",
      ),

    estado:
      String(
        api.estado ?? "",
      ),

    cep:
      String(
        api.cep ?? "",
      ),

    bairro:
      String(
        api.bairro ?? "",
      ),

    email:
      String(
        api.email ?? "",
      ),

    senha:
      String(
        api.senha ?? "",
      ),

    situacao,

    tipoUsuario,

    tipoUsuarioLabel:
      getTipoUsuarioLabel(
        tipoUsuario,
      ),

    situacaoLabel:
      getSituacaoLabel(
        situacao,
      ),

  };
};

export const toApiUsuarioPayload = (
  data: Partial<User>,

  base?: Partial<User>,
): User => {

  return {

    id:
      Number(
        data.id
        ?? base?.id
        ?? 0,
      ),

    cpf:
      String(
        data.cpf
        ?? base?.cpf
        ?? "",
      ),

    nome:
      String(
        data.nome
        ?? base?.nome
        ?? "",
      ),

    rg:
      String(
        data.rg
        ?? base?.rg
        ?? "",
      ),

    logradouro:
      String(
        data.logradouro
        ?? base?.logradouro
        ?? "",
      ),

    numero:
      String(
        data.numero
        ?? base?.numero
        ?? "",
      ),

    matricula:
      String(
        data.matricula
        ?? base?.matricula
        ?? "",
      ),

    cidade:
      String(
        data.cidade
        ?? base?.cidade
        ?? "",
      ),

    estado:
      String(
        data.estado
        ?? base?.estado
        ?? "",
      ),

    cep:
      String(
        data.cep
        ?? base?.cep
        ?? "",
      ),

    bairro:
      String(
        data.bairro
        ?? base?.bairro
        ?? "",
      ),

    email:
      String(
        data.email
        ?? base?.email
        ?? "",
      ),

    senha:
      String(
        data.senha
        ?? base?.senha
        ?? "",
      ),

    situacao:
      toNumber(
        data.situacao
        ?? base?.situacao,

        SITUACAO_ATIVO,
      ),

    tipoUsuario:
      toNumber(
        data.tipoUsuario
        ?? base?.tipoUsuario,

        1,
      ),

  };
};