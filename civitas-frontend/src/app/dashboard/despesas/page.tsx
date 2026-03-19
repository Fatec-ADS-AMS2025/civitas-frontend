"use client";
import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";

type TipoDespesa = {
  id: number;
  descricao: string;
  solicitaUC: "Sim" | "Não";
};

const novoTipoDespesa: TipoDespesa = {
  id: 0,
  descricao: "",
  solicitaUC: "Sim",
};

const columns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descrição" },
  { id: "solicitaUC", label: "Solicita UC" },
];

const camposConst: FieldConfig[] = [
  { key: "descricao", placeholder: "Descrição", local: "principal" },
  {
    key: "solicitaUC",
    placeholder: "Solicita UC",
    local: "principal",
    type: "select",
    options: [
      { value: "Sim", label: "Solicita UC" },
      { value: "Não", label: "Não solicita UC" },
    ],
  },
];

export default function Page() {
  const despesasBase: TipoDespesa[] = [
    { id: 1, descricao: "Material de Escritório", solicitaUC: "Sim" },
    { id: 2, descricao: "Transporte", solicitaUC: "Sim" },
    { id: 3, descricao: "Alimentação", solicitaUC: "Não" },
  ];

  const [sourceData, setSourceData] = useState<TipoDespesa[]>(despesasBase);
  const [dados, setDados] = useState<TipoDespesa[]>(despesasBase);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  const handleCreate = async (novo: Omit<TipoDespesa, 'id'>) => {
    const created = { ...novo, id: Date.now() };
    const next = [...sourceData, created];
    setSourceData(next);
    setDados(next);
    return created;
  };

  const handleUpdate = async (id: number, payload: Partial<TipoDespesa>) => {
    const next = sourceData.map((item) => item.id === id ? { ...item, ...payload } : item);
    setSourceData(next);
    setDados(next);
    return { id, ...payload };
  };

  const handleDelete = async (id: number) => {
    const next = sourceData.filter((item) => item.id !== id);
    setSourceData(next);
    setDados(next);
  };

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] font-bold leading-none text-[#0A5C66]">Listagem de Tipo de Despesa</h1>
          <p className="mt-2 text-sm text-[#B4B4B4]">Home &gt; Listagem &gt; Tipo Despesa</p>
        </div>
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-1 text-sm font-semibold text-[#3B3B3B]"><span className="material-symbols-outlined !text-[18px]">arrow_back</span> Voltar</button>
      </div>
      <SearchBar model={novoTipoDespesa} dados={sourceData} setDados={setDados} campos={campos} setCampos={setCampos} onCadastrar={handleCreate} />
      <Table data={dados} columns={columns} onEdit={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}
