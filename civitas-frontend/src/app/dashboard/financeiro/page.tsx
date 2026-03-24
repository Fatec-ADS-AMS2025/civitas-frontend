import React from 'react';
import FinanceiroTestSuite from '@/components/testefinanceiro/FinanceiroTestSuite';

export default function FinanceiroPage() {
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
          Visao financeira
        </h2>
        <p className="relative z-10 mt-2 max-w-3xl text-sm text-[#72808A] sm:text-base">
          Ambiente de validacao dos hooks financeiros para listagem, filtros, cadastro, atualizacao e exclusao.
        </p>
      </section>

      <FinanceiroTestSuite />
    </div>
  );
}
