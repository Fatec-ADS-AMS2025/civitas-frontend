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
    <div className="rounded-[20px] border border-[#E4EEF0] bg-[#FBFDFC] p-4">
      <h2 className="mb-1 text-lg font-semibold text-[#1F2A32]">Filtros financeiros</h2>
      <p className="mb-4 text-sm text-[#72808A]">
        Refine periodo, status e instituicao sem depender de novas mudancas de backend.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          type="date"
          value={dataInicio}
          onChange={(event) => setDataInicio(event.target.value)}
          className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(event) => setDataFim(event.target.value)}
          className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20"
        >
          <option value="">Status (todos)</option>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
        <select
          value={instituicaoId}
          onChange={(event) => setInstituicaoId(event.target.value)}
          className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20"
        >
          <option value="">Instituicao (todas)</option>
          {instituicoes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="rounded-2xl bg-[#58AFAE] px-4 py-2.5 font-semibold text-white transition hover:brightness-95"
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
          className="rounded-2xl border border-[#D5E3E6] bg-white px-4 py-2.5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB]"
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
