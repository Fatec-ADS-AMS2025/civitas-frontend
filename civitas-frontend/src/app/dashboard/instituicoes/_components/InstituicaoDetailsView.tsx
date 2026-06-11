"use client";

import {
  DetailCard,
  DetailCardGrid,
  DetailFieldGrid,
  DetailList,
  DetailSection,
} from "@/components/details/info-details";
import type { FinanceCodigoResumo, FinanceDespesaRelacionada } from "@/lib/financeiro-relations";
import type { InstituicaoRow } from "../_types";

type InstituicaoDetailsViewProps = {
  instituicao: InstituicaoRow;
};

const getEndereco = (instituicao: InstituicaoRow): string => {
  const partes = [
    instituicao.logradouro,
    instituicao.numero,
    instituicao.bairro,
    instituicao.cidade && instituicao.estado
      ? `${instituicao.cidade}/${instituicao.estado}`
      : instituicao.cidade || instituicao.estado,
    instituicao.cep,
  ].filter((item) => typeof item === "string" && item.trim().length > 0);

  return partes.length > 0 ? partes.join(", ") : "Endereco nao informado";
};

const renderCodigo = (codigo: FinanceCodigoResumo) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h4 className="truncate text-base font-semibold text-[var(--secundary-1)]">
        {codigo.codigo}
      </h4>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
        {codigo.quantidadeDespesas} despesa
        {codigo.quantidadeDespesas === 1 ? "" : "s"} em{" "}
        {codigo.quantidadeSecretarias} secretaria
        {codigo.quantidadeSecretarias === 1 ? "" : "s"}
      </p>
    </div>
    <div className="text-left sm:text-right">
      <span className="block text-sm font-semibold text-[var(--foreground)]">
        {codigo.totalGastosFormatado}
      </span>
      <span className="text-xs text-[var(--foreground-soft)]">
        Ultima ref.: {codigo.ultimaReferenciaFormatada}
      </span>
    </div>
  </div>
);

const renderDespesa = (despesa: FinanceDespesaRelacionada) => (
  <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
    <div className="min-w-0">
      <h4 className="truncate text-sm font-semibold text-[var(--foreground)]">
        {despesa.registro} - {despesa.descricao}
      </h4>
      <p className="mt-1 text-xs text-[var(--foreground-soft)]">
        {despesa.codigo} | {despesa.categoria}
      </p>
    </div>
    <div className="min-w-0">
      <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
        Status e data
      </span>
      <span className="mt-1 block text-sm text-[var(--foreground)]">
        {despesa.statusLabel} | {despesa.dataReferenciaFormatada}
      </span>
    </div>
    <strong className="text-left text-sm text-[var(--secundary-1)] md:text-right">
      {despesa.valorFormatado}
    </strong>
  </div>
);

export default function InstituicaoDetailsView({
  instituicao,
}: InstituicaoDetailsViewProps) {
  const financeiro = instituicao.financeiroResumo;
  const codigos = financeiro?.codigos ?? [];
  const despesas = financeiro?.despesas ?? [];

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground-muted)]">
        <span className="font-semibold text-[var(--foreground)]">Instituicao:</span>{" "}
        {instituicao.nome || "Instituicao nao informada"}
        <span className="mx-2 text-[var(--foreground-soft)]">|</span>
        <span className="font-semibold text-[var(--foreground)]">
          Secretaria vinculada:
        </span>{" "}
        {instituicao.secretariaLabel}
      </div>

      <DetailSection
        title="Resumo da instituicao"
        description="Indicadores principais e relacionamento institucional."
      >
        <DetailCardGrid>
          <DetailCard
            title="Status"
            value={instituicao.situacaoLabel}
            description="Situacao atual do cadastro"
            icon="verified"
            tone={instituicao.situacaoLabel === "Ativo" ? "teal" : "danger"}
          />
          <DetailCard
            title="Secretaria"
            value={instituicao.secretariaLabel}
            description="Vinculo administrativo"
            icon="account_tree"
            tone="slate"
          />
          <DetailCard
            title="Despesas"
            value={instituicao.quantidadeDespesas}
            description={`${instituicao.quantidadeCodigos} codigo${
              instituicao.quantidadeCodigos === 1 ? "" : "s"
            } relacionado${instituicao.quantidadeCodigos === 1 ? "" : "s"}`}
            icon="receipt_long"
            tone="amber"
          />
          <DetailCard
            title="Saldo"
            value={instituicao.saldoFormatado}
            description={`Gastos: ${instituicao.totalGastosFormatado}`}
            icon="payments"
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Dados complementares">
        <DetailFieldGrid
          items={[
            { label: "Nome", value: instituicao.nome },
            { label: "Razao social", value: instituicao.nomeRazaoSocial },
            { label: "Tipo", value: instituicao.tipoInstituicaoLabel },
            { label: "CNPJ", value: instituicao.cnpj },
            { label: "Telefone", value: instituicao.telefone },
            { label: "E-mail", value: instituicao.email },
            { label: "Endereco", value: getEndereco(instituicao) },
          ]}
        />
      </DetailSection>

      <DetailSection
        title="Codigos relacionados"
        description="Agrupamentos financeiros encontrados para esta instituicao."
      >
        <DetailList
          items={codigos}
          emptyMessage="Nenhum codigo vinculado a esta instituicao."
          getKey={(codigo) => codigo.codigoNormalizado}
          renderItem={renderCodigo}
        />
      </DetailSection>

      <DetailSection
        title="Despesas relacionadas"
        description="Lancamentos financeiros associados a instituicao."
      >
        <DetailList
          items={despesas}
          emptyMessage="Nenhuma despesa encontrada para esta instituicao."
          getKey={(despesa) => `${despesa.id}-${despesa.codigoNormalizado}`}
          renderItem={renderDespesa}
        />
      </DetailSection>
    </div>
  );
}
