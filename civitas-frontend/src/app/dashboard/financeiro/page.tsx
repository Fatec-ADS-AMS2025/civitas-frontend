'use client';

import React, { useMemo } from 'react';
import { useFinanceiro } from '@/hooks/financeiro';
import { useDashboardHeader } from '@/components/dashboard/dashboard-header';
import { useAppNavigation } from '@/hooks/useNavigationProgress';
import {
  FinanceiroHero,
  FinanceiroResumo,
  FinanceiroFiltros,
  FinanceiroFormulario,
  FinanceiroLista,
  FinanceiroErrorState,
} from './_components';
import FinanceiroSkeleton from './skeleton';

export default function FinanceiroPage() {
  const { push } = useAppNavigation();
  const {
    filtros,
    transacoes,
    allTransacoes,
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

  const headerConfig = useMemo(
    () => ({
      title: 'Financeiro',
      eyebrow: 'Monitoramento',
      subtitle:
        'Resumo financeiro, filtros e movimentações em um fluxo visual unificado com o restante do dashboard.',
      breadcrumbs: [
        { label: 'Home', href: '/dashboard' },
        { label: 'Financeiro' },
      ],
      actions: [
        {
          label: 'Atualizar dados',
          icon: 'refresh',
          variant: 'primary' as const,
          onClick: () => {
            void refetch();
          },
        },
        {
          label: 'Abrir despesas',
          icon: 'receipt_long',
          variant: 'ghost' as const,
          onClick: () => {
            push('/dashboard/despesas');
          },
        },
      ],
    }),
    [push, refetch]
  );

  useDashboardHeader(headerConfig);

  if (loading && !hasData) {
    return <FinanceiroSkeleton />;
  }

  if (error && !hasData) {
    return <FinanceiroErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="financeiro-root space-y-6">
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
        allTransacoes={allTransacoes}
        hasFiltersApplied={hasFiltersApplied}
        onDelete={excluir}
        loading={loading}
      />
    </div>
  );
}
