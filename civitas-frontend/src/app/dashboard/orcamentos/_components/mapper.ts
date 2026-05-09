export const mapOrcamentoRows = (
  orcamentos: any[],
  instituicoes: any[],
  tiposDespesa: any[]
) => {
  const instituicaoMap =
    new Map(
      instituicoes.map(
        (item) => [
          item.id,
          item.nome,
        ]
      )
    );

  const tipoMap =
    new Map(
      tiposDespesa.map(
        (item) => [
          item.id,
          item.descricao,
        ]
      )
    );

  return orcamentos.map(
    (orcamento) => ({
      ...orcamento,

      instituicaoLabel:
        instituicaoMap.get(
          orcamento.idInstituicao
        ),

      tipoDespesaLabel:
        tipoMap.get(
          orcamento.idTipoDespesa
        ),
    })
  );
};