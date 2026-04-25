'use client';

import React from 'react';
import FinanceiroCrudTeste from './FinanceiroCrudTeste';
import FinanceiroFiltrosTeste from './FinanceiroFiltros';
import FinanceiroListaTeste from './FinanceiroLista';
import FinanceiroResumoTeste from './FinanceiroResumo';
import { useFinanceiro } from '@/hooks/financeiro';

export default function FinanceiroTestSuite() {
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
    aplicarFiltros,
    cadastrar,
    atualizar,
    excluir,
  } = useFinanceiro();

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-5">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2A32]">Resumo e filtros</h3>
        <div className="space-y-4">
          <FinanceiroResumoTeste resumo={resumo} />
          <FinanceiroFiltrosTeste
            instituicoes={instituicoes}
            filtrosAtuais={filtros}
            onApply={aplicarFiltros}
            loading={loading}
          />
        </div>
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
        <h3 className="mb-4 text-lg font-semibold text-[#1F2A32]">Transacoes</h3>
        <FinanceiroListaTeste
          loading={loading}
          transacoes={transacoes}
          onDelete={excluir}
        />
      </section>
    </div>
  );
}
