"use client";

import { DetailCard, DetailCardGrid, DetailFieldGrid, DetailSection } from "@/components/details/info-details";
import type { UnidadeConsumidoraRow } from "./UnidadesConsumidorasPageClient";

type UnidadeConsumidoraDetailsViewProps = {
  unidade: UnidadeConsumidoraRow;
};

export default function UnidadeConsumidoraDetailsView({ unidade }: UnidadeConsumidoraDetailsViewProps) {
  return (
    <div className="space-y-5">
      <DetailSection
        title="Resumo da unidade consumidora"
        description="Vinculos operacionais usados para classificar despesas."
      >
        <DetailCardGrid>
          <DetailCard
            title="Identificador"
            value={unidade.identificador}
            description="Codigo operacional da unidade"
            icon="tag"
            tone="teal"
          />
          <DetailCard
            title="Instituicao"
            value={unidade.instituicaoLabel}
            description={unidade.secretariaLabel}
            icon="account_balance"
            tone="slate"
          />
          <DetailCard
            title="Orcamento"
            value={unidade.orcamentoLabel}
            description={unidade.tipoDespesaLabel}
            icon="request_quote"
            tone="amber"
          />
          <DetailCard
            title="Status"
            value={unidade.situacaoLabel}
            description="Situacao para novos lancamentos"
            icon="verified"
            tone={unidade.excluido ? "danger" : "default"}
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Relacionamentos">
        <DetailFieldGrid
          items={[
            { label: "Instituicao", value: unidade.instituicaoLabel },
            { label: "Secretaria", value: unidade.secretariaLabel },
            { label: "Tipo de despesa", value: unidade.tipoDespesaLabel },
            { label: "Orcamento", value: unidade.orcamentoLabel },
            { label: "Fornecedor", value: unidade.fornecedorLabel },
          ]}
        />
      </DetailSection>
    </div>
  );
}
