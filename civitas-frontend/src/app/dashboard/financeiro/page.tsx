'use client';

import React, { useMemo } from 'react';
import { useFinanceiro } from '@/hooks/financeiro';
import {
  FinanceiroHero,
  FinanceiroResumo,
  FinanceiroFiltros,
  FinanceiroFormulario,
  FinanceiroLista,
  FinanceiroLoadingState,
  FinanceiroErrorState,
} from '@/components/testefinanceiro';

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
    hasData,
    aplicarFiltros,
    refetch,
    cadastrar,
    atualizar,
    excluir,
  } = useFinanceiro();

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
    return <FinanceiroErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Hero com indicadores principais */}
      <FinanceiroHero
        resumo={resumo}
        filtros={filtros}
        instituicoesCount={instituicoes.length}
      />

      {/* Cards de resumo financeiro */}
      <FinanceiroResumo resumo={resumo} />

      {/* Seção de Filtros e Operação */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Filtros */}
        <FinanceiroFiltros
          instituicoes={instituicoes}
          filtrosAtuais={filtros}
          onApply={aplicarFiltros}
          loading={loading}
        />

        {/* Cadastro e Atualização */}
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

      {/* Listagem de transações */}
      <FinanceiroLista
        transacoes={transacoes}
        hasFiltersApplied={hasFiltersApplied}
        onDelete={excluir}
        loading={loading}
      />
    </div>
  );
}
