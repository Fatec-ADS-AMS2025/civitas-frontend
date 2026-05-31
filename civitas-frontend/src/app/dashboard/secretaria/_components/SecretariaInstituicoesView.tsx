"use client";

import {
  DetailCard,
  DetailCardGrid,
  DetailFieldGrid,
  DetailList,
  DetailSection,
} from "@/components/details/info-details";
import { getSituacaoLabel } from "@/global/situacao";
import type { SecretariaRow } from "@/hooks/useSecretariaPage";
import type InstituicaoDTO from "@/models/instituicao";

type SecretariaInstituicoesViewProps = {
  secretaria: SecretariaRow;
};

const getInstituicaoLocalidade = (instituicao: InstituicaoDTO): string => {
  const cidade = instituicao.cidade?.trim();
  const estado = instituicao.estado?.trim();

  if (cidade && estado) return `${cidade}/${estado}`;
  if (cidade) return cidade;
  if (estado) return estado;
  return "Localidade nao informada";
};

const getSecretariaEndereco = (secretaria: SecretariaRow): string => {
  const partes = [
    secretaria.logradouro,
    secretaria.numero,
    secretaria.bairro,
    secretaria.cidade && secretaria.estado
      ? `${secretaria.cidade}/${secretaria.estado}`
      : secretaria.cidade || secretaria.estado,
    secretaria.cep,
  ].filter((item) => typeof item === "string" && item.trim().length > 0);

  return partes.length > 0 ? partes.join(", ") : "Endereco nao informado";
};

export default function SecretariaInstituicoesView({
  secretaria,
}: SecretariaInstituicoesViewProps) {
  const instituicoes = secretaria.instituicoesRelacionadas;

  return (
    <div className="space-y-5">
      <DetailSection
        title="Resumo da secretaria"
        description="Dados principais agrupados para leitura rapida."
      >
        <DetailCardGrid>
          <DetailCard
            title="Status"
            value={secretaria.situacaoLabel}
            description="Situacao atual do cadastro"
            icon="verified"
            tone={secretaria.situacaoLabel === "Ativo" ? "teal" : "danger"}
          />
          <DetailCard
            title="Instituicoes"
            value={instituicoes.length}
            description="Vinculos encontrados para esta secretaria"
            icon="account_balance"
            tone="amber"
          />
          <DetailCard
            title="Orcamento total"
            value={secretaria.totalOrcamentosFormatado}
            description={`Saldo: ${secretaria.saldoFormatado}`}
            icon="request_quote"
            tone="slate"
          />
          <DetailCard
            title="Despesas"
            value={secretaria.totalGastosFormatado}
            description={`${secretaria.quantidadeDespesas} lancamento${
              secretaria.quantidadeDespesas === 1 ? "" : "s"
            } em ${secretaria.quantidadeCodigos} codigo${
              secretaria.quantidadeCodigos === 1 ? "" : "s"
            }`}
            icon="receipt_long"
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Dados complementares">
        <DetailFieldGrid
          items={[
            { label: "Nome", value: secretaria.nome },
            { label: "Razao social", value: secretaria.nomeRazaoSocial },
            { label: "CNPJ", value: secretaria.cnpj },
            { label: "Descricao", value: secretaria.descricao },
            { label: "E-mail", value: secretaria.email },
            { label: "Endereco", value: getSecretariaEndereco(secretaria) },
          ]}
        />
      </DetailSection>

      <DetailSection
        title="Instituicoes vinculadas"
        description={`${instituicoes.length} instituicao${
          instituicoes.length === 1 ? "" : "es"
        } nesta secretaria.`}
      >
        <DetailList
          items={instituicoes}
          emptyMessage="Nenhuma instituicao vinculada a esta secretaria."
          getKey={(instituicao) => instituicao.id}
          renderItem={(instituicao, index) => (
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] text-sm font-semibold text-[var(--secundary-1)]">
                {index + 1}
              </span>

              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {instituicao.nome || "Instituicao sem nome"}
                </h4>
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                  {getSituacaoLabel(instituicao.situacao)} | CNPJ:{" "}
                  {instituicao.cnpj || "Nao informado"}
                </p>
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                  Localidade
                </span>
                <span className="mt-1 block truncate text-sm text-[var(--foreground)]">
                  {getInstituicaoLocalidade(instituicao)}
                </span>
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                  Contato
                </span>
                <span className="mt-1 block truncate text-sm text-[var(--foreground)]">
                  {instituicao.telefone || "Telefone nao informado"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--foreground-soft)]">
                  {instituicao.email || "E-mail nao informado"}
                </span>
              </div>
            </div>
          )}
        />
      </DetailSection>
    </div>
  );
}
