"use client";

import React, { useEffect, useMemo } from "react";
import Table from "@/components/Table/table";
import FinanceiroCrudTeste from "@/components/testefinanceiro/FinanceiroCrudTeste";
import FinanceiroFiltrosTeste from "@/components/testefinanceiro/FinanceiroFiltrosTeste";
import { EmptyState, LoadingState } from "@/components/feedback-states";
import { useFinanceiro } from "@/hooks/financeiro";
import { useClientPagination } from "@/hooks/useClientPagination";

type FinanceiroTableRow = {
  id: number;
  tipoLabel: string;
  descricao: string;
  valorFormatado: string;
  dataFormatada: string;
  situacaoLabel: string;
  tipo: "despesa" | "orcamento";
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
};

export default function FinanceiroPage() {
  const {
    filtros,
    transacoes,
    resumo,
    instituicoes,
    tiposDespesa,
    orcamentos,
    fornecedores,
    usuarios,
    loading,
    error,
    aplicarFiltros,
    refetch,
    cadastrar,
    atualizar,
    excluir,
  } = useFinanceiro();

  const tableRows = useMemo<FinanceiroTableRow[]>(() => {
    return transacoes.map((item) => ({
      id: item.id,
      tipoLabel: item.tipo === "despesa" ? "Despesa" : "Orcamento",
      descricao: item.descricao,
      valorFormatado: formatCurrency(item.valor),
      dataFormatada: formatDate(item.data),
      situacaoLabel: item.situacao === 1 ? "Ativo" : "Inativo",
      tipo: item.tipo,
    }));
  }, [transacoes]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    isPending,
    goToPage,
    changePageSize,
    resetPagination,
  } = useClientPagination(tableRows, { initialPageSize: 6 });

  useEffect(() => {
    resetPagination();
  }, [filtros, resetPagination]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[#E4EEF0] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#F1F8F9]" />
        <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[#DCEBED] bg-[#F8FCFC] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6C858E]">
          Modulo
          <span className="h-1.5 w-1.5 rounded-full bg-[#58AFAE]" />
          Financeiro
        </div>
        <h2 className="relative z-10 mt-4 text-[30px] font-bold leading-tight text-[#1F2A32] sm:text-[34px]">
          Visao financeira unificada
        </h2>
        <p className="relative z-10 mt-2 max-w-3xl text-sm text-[#72808A] sm:text-base">
          Resumo, filtros, CRUD e listagem seguem o mesmo padrao de estados visuais e feedbacks adotado nas telas da sprint.
        </p>
      </section>

      <section className="rounded-[24px] border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-5">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2A32]">Resumo e filtros</h3>

        {loading && !resumo ? (
          <LoadingState title="Carregando resumo financeiro" description="Atualizando indicadores e filtros da tela." rows={2} cols={4} />
        ) : resumo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ResumoCard title="Total de despesas" value={formatCurrency(resumo.totalDespesas)} tone="danger" />
              <ResumoCard title="Total de orcamentos" value={formatCurrency(resumo.totalOrcamentos)} tone="success" />
              <ResumoCard title="Saldo" value={formatCurrency(resumo.saldo)} tone="info" />
              <ResumoCard title="Transacoes" value={String(resumo.totalTransacoes)} tone="neutral" />
            </div>

            <FinanceiroFiltrosTeste instituicoes={instituicoes} onApply={aplicarFiltros} />
          </div>
        ) : (
          <EmptyState
            title="Resumo indisponivel"
            description="Nao existem dados suficientes para montar os indicadores financeiros neste momento."
          />
        )}
      </section>

      <section className="rounded-[24px] border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-5">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2A32]">Cadastro e atualizacao</h3>
        <FinanceiroCrudTeste
          transacoes={transacoes}
          instituicoes={instituicoes}
          tiposDespesa={tiposDespesa}
          orcamentos={orcamentos}
          fornecedores={fornecedores}
          usuarios={usuarios}
          onCreate={cadastrar}
          onUpdate={atualizar}
        />
      </section>

      <section className="rounded-[24px] border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1F2A32]">Transacoes</h3>
            <p className="mt-1 text-sm text-[#72808A]">A listagem usa retry, paginação client-side e feedback consistente ao carregar ou falhar.</p>
          </div>
        </div>

        <Table<FinanceiroTableRow>
          data={paginatedItems}
          columns={[
            { id: "id", label: "ID" },
            { id: "tipoLabel", label: "Tipo" },
            { id: "descricao", label: "Descricao" },
            { id: "valorFormatado", label: "Valor" },
            { id: "dataFormatada", label: "Data" },
            { id: "situacaoLabel", label: "Situacao" },
          ]}
          actions={["delete"]}
          onDelete={async (id) => {
            const item = tableRows.find((row) => row.id === id);
            if (!item) return;
            await excluir(id, item.tipo);
          }}
          isLoading={loading || isPending}
          loadingTitle="Carregando transacoes"
          errorMessage={error}
          onRetry={() => void refetch()}
          emptyTitle="Nenhuma transacao encontrada"
          emptyDescription="Ajuste os filtros financeiros ou cadastre um novo item para preencher a listagem."
          paginationEnabled
          pagination={{
            currentPage,
            totalPages,
            totalRecords,
            pageSize,
            pageSizeOptions: [6, 10, 20],
            onPageChange: goToPage,
            onPageSizeChange: changePageSize,
          }}
        />
      </section>
    </div>
  );
}

function ResumoCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "danger" | "success" | "info" | "neutral";
}) {
  const toneClasses = {
    danger: {
      container: "border-[#F2D9D9] bg-[#FFF7F7]",
      title: "text-[#8A5D5D]",
      value: "text-[#C85A5A]",
    },
    success: {
      container: "border-[#D8EEE6] bg-[#F5FBF8]",
      title: "text-[#5B8575]",
      value: "text-[#2F8F68]",
    },
    info: {
      container: "border-[#D9EAF2] bg-[#F4FAFD]",
      title: "text-[#59798A]",
      value: "text-[#2B6F93]",
    },
    neutral: {
      container: "border-[#E4EEF0] bg-white",
      title: "text-[#72808A]",
      value: "text-[#1F2A32]",
    },
  } as const;
  const classes = toneClasses[tone];

  return (
    <div className={`rounded-[20px] border p-4 ${classes.container}`}>
      <p className={`text-sm ${classes.title}`}>{title}</p>
      <p className={`text-xl font-semibold ${classes.value}`}>{value}</p>
    </div>
  );
}
