"use client";

import React, { useMemo } from "react";

import {
  FinanceiroHero,
  FinanceiroResumo,
  FinanceiroFiltros,
  FinanceiroFormulario,
  FinanceiroLista,
  FinanceiroLoadingState,
  FinanceiroErrorState,
} from "@/components/testefinanceiro";

import { useFinanceiroPage } from "./useFinanceiroPage";

export default function FinanceiroContent() {
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
    hasData,
    aplicarFiltros,
    refetch,
    cadastrar,
    atualizar,
    excluir,
  } = useFinanceiroPage();

  const hasFiltersApplied = useMemo(() => {
    return !!(
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.status !== undefined ||
      filtros.instituicaoId
    );
  }, [filtros]);

  if (loading && !hasData) {
    return <FinanceiroLoadingState />;
  }

  if (error && !hasData) {
    return (
      <FinanceiroErrorState
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="financeiro-root space-y-6">
      <FinanceiroHero
        resumo={resumo}
        filtros={filtros}
        instituicoesCount={instituicoes.length}
      />

      <FinanceiroResumo resumo={resumo} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinanceiroFiltros
          instituicoes={instituicoes}
          filtrosAtuais={filtros}
          onApply={aplicarFiltros}
          loading={loading}
        />

        <FinanceiroFormulario
          transacoes={transacoes}
          instituicoes={instituicoes}
          tiposDespesa={tiposDespesa}
          orcamentos={orcamentos}
          fornecedores={fornecedores}
          usuarios={usuarios}
          onCreate={cadastrar}
          onUpdate={atualizar}
          loading={loading}
        />
      </div>

      <FinanceiroLista
        transacoes={transacoes}
        hasFiltersApplied={hasFiltersApplied}
        onDelete={excluir}
        loading={loading}
      />
    </div>
  );
}