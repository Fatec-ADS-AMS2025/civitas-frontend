import React from 'react';
import FinanceiroTestSuite from '@/components/testefinanceiro/FinanceiroTestSuite';

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[#EFE8DE] bg-[#FFFDFB] p-6 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F8F4EC]" />
        <div className="relative z-10 flex gap-1 text-[#C9C2B7]">
          <span className="h-2 w-2 rounded-full bg-current" />
          <span className="h-2 w-2 rounded-full bg-current" />
          <span className="h-2 w-2 rounded-full bg-current" />
        </div>
        <h2 className="relative z-10 mt-4 text-[30px] font-bold leading-tight text-[#232323] sm:text-[34px]">
          Visao Financeira
        </h2>
        <p className="relative z-10 mt-2 max-w-3xl text-sm text-[#8E8E8E] sm:text-base">
          Ambiente de validacao dos hooks financeiros para listagem, filtros, cadastro, atualizacao e exclusao.
        </p>
      </section>

      <FinanceiroTestSuite />
    </div>
  );
}
