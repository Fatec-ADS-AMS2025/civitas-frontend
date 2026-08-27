"use client";

import { DetailCard, DetailCardGrid, DetailFieldGrid, DetailSection } from "@/components/details/info-details";
import type { OrcamentoRow } from "./OrcamentosPageClient";

type OrcamentoDetailsViewProps = {
  orcamento: OrcamentoRow;
};

export default function OrcamentoDetailsView({ orcamento }: OrcamentoDetailsViewProps) {
  return (
    <div className="space-y-5">
      <DetailSection
        title="Resumo do orcamento"
        description="Valores previstos, realizados e saldo calculado a partir das despesas vinculadas."
      >
        <DetailCardGrid>
          <DetailCard
            title="Valor previsto"
            value={orcamento.valorPrevistoFormatado}
            description="Valor cadastrado para o orcamento"
            icon="request_quote"
            tone="teal"
          />
          <DetailCard
            title="Valor total/realizado"
            value={orcamento.valorRealizadoFormatado}
            description="Total das despesas vinculadas"
            icon="receipt_long"
            tone="amber"
          />
          <DetailCard
            title="Saldo"
            value={orcamento.saldoFormatado}
            description="Previsto menos realizado"
            icon="account_balance_wallet"
            tone={orcamento.saldo >= 0 ? "slate" : "danger"}
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Vinculos">
        <DetailFieldGrid
          items={[
            { label: "Ano", value: orcamento.anoOrcamento ?? orcamento.ano },
            { label: "Instituicao", value: orcamento.instituicaoLabel },
            { label: "Tipo de despesa", value: orcamento.tipoDespesaLabel },
            {
              label: "Despesas vinculadas",
              value: orcamento.quantidadeDespesasRelacionadas,
            },
          ]}
        />
      </DetailSection>
    </div>
  );
}
