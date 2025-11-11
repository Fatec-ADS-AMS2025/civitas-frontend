"use client";
import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";

type Orcamento = {
  id: number;
  ano: number;
  valor: string;
};

const columns = [
  { id: "id", label: "ID Orçamento" },
  { id: "ano", label: "Ano" },
  { id: "valor", label: "Valor" },
];

const camposConst: FieldConfig[] = [
  { key: "ano", placeholder: "Ano", local: "principal" },
  { key: "valor", placeholder: "Valor", local: "principal" },
];

const OrcamentosPage = () => {
  const orcamentos: Orcamento[] = [
    {
      id: 100,
      ano: 2021,
      valor: "R$ 21.500",
    },
    {
      id: 101,
      ano: 2022,
      valor: "R$ 25.000",
    },
    {
      id: 102,
      ano: 2023,
      valor: "R$ 30.000",
    },
    {
      id: 103,
      ano: 2024,
      valor: "R$ 35.500",
    },
    {
      id: 104,
      ano: 2025,
      valor: "R$ 40.000",
    },
  ];

  const [filteredData, setFilteredData] = useState<Orcamento[]>(orcamentos);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar dados={orcamentos} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default OrcamentosPage;
