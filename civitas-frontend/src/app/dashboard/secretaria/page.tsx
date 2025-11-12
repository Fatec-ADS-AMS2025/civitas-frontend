"use client";

import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";

type Secretaria = {
  id: number;
  nome: string;
  cep: string;
  cnpj: string;
  razao: string;
  situacao: "Ativa" | "Inativa";
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cep", label: "CEP" },
  { id: "cnpj", label: "CNPJ" },
  { id: "razao", label: "Razão Social" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "cep", placeholder: "CEP", local: "filtro" },
  { key: "razao", placeholder: "Razão Social", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situação",
    local: "filtro",
    type: "select",
    options: [
      { value: "Ativa", label: "Ativa" },
      { value: "Inativa", label: "Inativa" },
    ],
  },
];

const Page = () => {

  const secretarias: Secretaria[] = [
    {
      id: 1,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 2,
      nome: "Educação",
      cep: "15524-849",
      cnpj: "12.345.645/0001-60",
      razao: "Centro Estadual...",
      situacao: "Inativa",
    },
    {
      id: 3,
      nome: "Educação",
      cep: "01421-679",
      cnpj: "13.241.678/0001-30",
      razao: "Centro Estadual...",
      situacao: "Inativa",
    },
    {
      id: 4,
      nome: "Educação",
      cep: "01234-039",
      cnpj: "76.345.678/0001-10",
      razao: "Centro Estadual...",
      situacao: "Inativa",
    },
    {
      id: 5,
      nome: "Educação",
      cep: "04394-329",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 6,
      nome: "Educação",
      cep: "01234-043",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 7,
      nome: "Educação",
      cep: "01424-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Inativa",
    },
    {
      id: 8,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 9,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 10,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 11,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
    {
      id: 12,
      nome: "Educação",
      cep: "01124-069",
      cnpj: "12.345.678/0001-90",
      razao: "Centro Estadual...",
      situacao: "Ativa",
    },
  ];
  

  const [filteredData, setFilteredData] = useState<Secretaria[]>(secretarias);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar dados={secretarias} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default Page;
