"use client";

import {
  DetailCard,
  DetailCardGrid,
  DetailFieldGrid,
  DetailSection,
} from "@/components/details/info-details";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { getDespesaCodigo } from "../despesas.utils";

type DespesaDetailsViewProps = {
  despesa: DespesaDashboardRow;
};

const getDocumentStatus = (despesa: DespesaDashboardRow): string => {
  if (despesa.documentoConfiavel) {
    return "Anexo vinculado";
  }

  return "Sem anexo";
};

export default function DespesaDetailsView({ despesa }: DespesaDetailsViewProps) {
  return (
    <div className="space-y-5">
      <DetailSection
        title="Resumo da despesa"
        description="Valores, status e principais relacionamentos do lancamento."
      >
        <DetailCardGrid>
          <DetailCard
            title="Valor previsto"
            value={despesa.valorFormatado}
            description="Valor informado no cadastro"
            icon="payments"
            tone="teal"
          />
          <DetailCard
            title="Status"
            value={despesa.situacaoLabel}
            description="Situacao financeira atual"
            icon="verified"
            tone={despesa.situacao === 3 ? "danger" : "amber"}
          />
          <DetailCard
            title="Codigo"
            value={getDespesaCodigo(despesa)}
            description={despesa.tipoCodigoNome}
            icon="tag"
            tone="slate"
          />
          <DetailCard
            title="Documento"
            value={getDocumentStatus(despesa)}
            description={despesa.numeroDocumento || "Numero nao informado"}
            icon="attach_file"
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Relacionamentos">
        <DetailFieldGrid
          items={[
            { label: "Instituicao", value: despesa.instituicaoNome },
            { label: "Secretaria", value: despesa.secretariaNome },
            { label: "Categoria", value: despesa.categoria },
            { label: "Unidade consumidora", value: despesa.raw.uc },
            { label: "Solicita UC", value: despesa.solicitaUcLabel },
            { label: "Orcamento", value: despesa.raw.idOrcamento ? `#${despesa.raw.idOrcamento}` : "" },
            { label: "Fornecedor", value: despesa.raw.idFornecedor ? `#${despesa.raw.idFornecedor}` : "" },
            { label: "Usuario responsavel", value: despesa.raw.idUsuario ? `#${despesa.raw.idUsuario}` : "" },
          ]}
        />
      </DetailSection>

      <DetailSection title="Datas e consumo">
        <DetailFieldGrid
          items={[
            { label: "Data de referencia", value: despesa.dataFormatada },
            { label: "Emissao", value: despesa.raw.dataEmissao ?? despesa.raw.dataEmicao },
            { label: "Vencimento", value: despesa.raw.dataVencimento },
            { label: "Pagamento", value: despesa.raw.dataPagamento },
            { label: "Consumo previsto", value: despesa.raw.consumoPrevisto },
            { label: "Consumo real", value: despesa.raw.consumoReal },
            { label: "Valor pago", value: despesa.raw.valorPago },
          ]}
        />
      </DetailSection>
    </div>
  );
}
