import React, { useState } from 'react';
import { FinanceiroFiltrosDTO } from '@/models/financeiro';
import InstituicaoDTO from '@/models/instituicao';

type FinanceiroFiltrosTesteProps = {
  instituicoes: InstituicaoDTO[];
  onApply: (filters: Partial<FinanceiroFiltrosDTO>) => void;
};

export default function FinanceiroFiltrosTeste({ instituicoes, onApply }: FinanceiroFiltrosTesteProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('');
  const [instituicaoId, setInstituicaoId] = useState('');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Filtros de teste</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          type="date"
          value={dataInicio}
          onChange={(event) => setDataInicio(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(event) => setDataFim(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">Status (todos)</option>
          <option value="1">Ativo</option>
          <option value="2">Inativo</option>
        </select>
        <select
          value={instituicaoId}
          onChange={(event) => setInstituicaoId(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">Instituição (todas)</option>
          {instituicoes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded bg-[#004C57] px-4 py-2 text-white"
          onClick={() =>
            onApply({
              dataInicio: dataInicio || undefined,
              dataFim: dataFim || undefined,
              status: status ? Number(status) : undefined,
              instituicaoId: instituicaoId ? Number(instituicaoId) : undefined,
            })
          }
        >
          Aplicar filtros
        </button>
        <button
          className="rounded border border-gray-300 px-4 py-2"
          onClick={() => {
            setDataInicio('');
            setDataFim('');
            setStatus('');
            setInstituicaoId('');
            onApply({
              dataInicio: undefined,
              dataFim: undefined,
              status: undefined,
              instituicaoId: undefined,
            });
          }}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
