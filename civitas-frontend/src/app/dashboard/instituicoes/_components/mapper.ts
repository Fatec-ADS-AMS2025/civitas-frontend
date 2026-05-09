import {
  getSituacaoLabel,
  SITUACAO_INATIVO,
} from "@/global/situacao";

export const buildLookupLabel = (
  label: string,
  situacao?: number
) => {
  if (
    situacao === SITUACAO_INATIVO
  ) {
    return `${label} (Inativo)`;
  }

  return label;
};

export const mapInstituicaoRows = (
  instituicoes: any[],
  secretarias: any[],
  tiposInstituicao: any[]
) => {
  const secretariaMap = new Map(
    secretarias.map((item) => [
      item.idSecretaria,
      item.nome,
    ])
  );

  const tipoMap = new Map(
    tiposInstituicao.map((item) => [
      item.id,
      item.descricao,
    ])
  );

  return instituicoes.map(
    (instituicao) => ({
      ...instituicao,

      situacaoLabel:
        getSituacaoLabel(
          instituicao.situacao
        ),

      secretariaLabel:
        secretariaMap.get(
          instituicao.idSecretaria
        ) ??
        `Secretaria #${instituicao.idSecretaria}`,

      tipoInstituicaoLabel:
        tipoMap.get(
          instituicao.idTipoInstituicao
        ) ??
        `Tipo #${instituicao.idTipoInstituicao}`,
    })
  );
};