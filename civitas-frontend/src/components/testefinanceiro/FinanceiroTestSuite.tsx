'use client';

import React from 'react';
import FinanceiroCrudTeste from '@/components/testefinanceiro/FinanceiroCrudTeste';
import FinanceiroFiltrosTeste from '@/components/testefinanceiro/FinanceiroFiltrosTeste';
import FinanceiroListaTeste from '@/components/testefinanceiro/FinanceiroListaTeste';
import FinanceiroResumoTeste from '@/components/testefinanceiro/FinanceiroResumoTeste';
import { useFinanceiro } from '@/hooks/financeiro';

export default function FinanceiroTestSuite() {
  const {
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
    cadastrar,
    atualizar,
    excluir,
  } = useFinanceiro();

  return (
    <div className="space-y-4">
      <FinanceiroResumoTeste resumo={resumo} loading={loading} />
      <FinanceiroFiltrosTeste instituicoes={instituicoes} onApply={aplicarFiltros} />
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
      <FinanceiroListaTeste
        loading={loading}
        error={error}
        hasData={hasData}
        transacoes={transacoes}
        onDelete={excluir}
      />
    </div>
  );
}
