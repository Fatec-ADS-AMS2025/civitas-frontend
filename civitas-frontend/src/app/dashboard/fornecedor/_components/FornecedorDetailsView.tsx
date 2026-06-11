"use client";

import {
  DetailCard,
  DetailCardGrid,
  DetailFieldGrid,
  DetailSection,
} from "@/components/details/info-details";
import type { FornecedorRow } from "./FornecedorPageClient";

type FornecedorDetailsViewProps = {
  fornecedor: FornecedorRow;
};

const getLocalidade = (fornecedor: FornecedorRow): string => {
  if (fornecedor.cidade && fornecedor.estado) {
    return `${fornecedor.cidade}/${fornecedor.estado}`;
  }

  return fornecedor.cidade || fornecedor.estado || "";
};

export default function FornecedorDetailsView({
  fornecedor,
}: FornecedorDetailsViewProps) {
  return (
    <div className="space-y-5">
      <DetailSection
        title="Resumo do fornecedor"
        description="Identificacao fiscal, contato e situacao cadastral."
      >
        <DetailCardGrid>
          <DetailCard
            title="Status"
            value={fornecedor.situacaoLabel}
            description="Situacao atual para novos vinculos"
            icon="verified"
            tone={fornecedor.situacaoLabel === "Ativo" ? "teal" : "danger"}
          />
          <DetailCard
            title="Documento fiscal"
            value={fornecedor.cnpj}
            description="CNPJ cadastrado"
            icon="article"
            tone="slate"
          />
          <DetailCard
            title="Contato"
            value={fornecedor.telefone}
            description={fornecedor.email || "E-mail nao informado"}
            icon="call"
            tone="amber"
          />
          <DetailCard
            title="Localidade"
            value={getLocalidade(fornecedor)}
            description="Cidade/UF de atendimento"
            icon="location_on"
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Dados complementares">
        <DetailFieldGrid
          items={[
            { label: "Nome fantasia", value: fornecedor.nomeFantasia },
            { label: "Razao social / nome", value: fornecedor.nome },
            { label: "CNPJ", value: fornecedor.cnpj },
            { label: "Telefone", value: fornecedor.telefone },
            { label: "E-mail", value: fornecedor.email },
            {
              label: "Endereco",
              value: `${fornecedor.logradouro}, ${fornecedor.numero} - ${fornecedor.bairro}`,
            },
            { label: "CEP", value: fornecedor.cep },
          ]}
        />
      </DetailSection>
    </div>
  );
}
