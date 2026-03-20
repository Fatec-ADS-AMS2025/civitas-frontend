import React from 'react';
import FinanceiroTestSuite from '@/components/testefinanceiro/FinanceiroTestSuite';

export default function FinanceiroPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Página de validação dos hooks financeiros para listagem, filtros, cadastro, atualização e exclusão.
      </p>
      <FinanceiroTestSuite />
    </div>
  );
}
