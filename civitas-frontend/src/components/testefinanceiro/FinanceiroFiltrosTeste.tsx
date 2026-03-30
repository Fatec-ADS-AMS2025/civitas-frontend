import React, { useState } from 'react';
import { FinanceiroFiltrosDTO } from '@/models/financeiro';
import InstituicaoDTO from '@/models/instituicao';

type FinanceiroFiltrosTesteProps = {
  instituicoes: InstituicaoDTO[];
  onApply: (filters: Partial<FinanceiroFiltrosDTO>) => void;
};

const inputClassName =
  'h-[46px] rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20';

export default function FinanceiroFiltrosTeste({ instituicoes, onApply }: FinanceiroFiltrosTesteProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('');
  const [instituicaoId, setInstituicaoId] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply({
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      status: status ? Number(status) : undefined,
      instituicaoId: instituicaoId ? Number(instituicaoId) : undefined,
    });
  };

  const handleClear = () => {
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
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E4EEF0] bg-white p-4" aria-label="Filtros financeiros">
      <h2 className="mb-3 text-lg font-semibold text-[#1F2A32]">Filtros</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          type="date"
          value={dataInicio}
          onChange={(event) => setDataInicio(event.target.value)}
          className={inputClassName}
          aria-label="Data inicial"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(event) => setDataFim(event.target.value)}
          className={inputClassName}
          aria-label="Data final"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={inputClassName}
          aria-label="Status"
        >
          <option value="">Status (todos)</option>
          <option value="1">Ativo</option>
          <option value="2">Inativo</option>
        </select>
        <select
          value={instituicaoId}
          onChange={(event) => setInstituicaoId(event.target.value)}
          className={inputClassName}
          aria-label="Instituicao"
        >
          <option value="">Instituicao (todas)</option>
          {instituicoes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="h-[46px] rounded-2xl bg-[#004C57] px-4 font-semibold text-white transition hover:brightness-95"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          className="h-[46px] rounded-2xl border border-[#D5E3E6] bg-white px-4 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB]"
          onClick={handleClear}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
