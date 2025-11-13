"use client";
import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";

type Fornecedor = {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  situacao: "Ativo" | "Inativo";
};

const novoFornecedor: Fornecedor = {
  id: 0,
  nomeFantasia: "",
  cnpj: "",
  telefone: "",
  situacao: "Ativo",
};

const columns = [
  { id: "id", label: "ID" },
  { id: "nomeFantasia", label: "Nome Fantasia" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situação",
    local: "filtro",
    type: "select",
    options: [
      { value: "Ativo", label: "Ativo" },
      { value: "Inativo", label: "Inativo" },
    ],
  },
];

const Page = () => {

  const fornecedores: Fornecedor[] = [
    { id: 100, nomeFantasia: "Alpha Tech", cnpj: "12.345.678/0001-90", telefone: "(11) 98888-9999", situacao: "Ativo" },
    { id: 101, nomeFantasia: "Global Farma", cnpj: "98.765.432/0001-11", telefone: "(31) 97777-4444", situacao: "Inativo" },
    { id: 102, nomeFantasia: "Construmax", cnpj: "45.678.912/0001-22", telefone: "(21) 96666-3333", situacao: "Ativo" },
    { id: 103, nomeFantasia: "Eco Verde", cnpj: "55.666.777/0001-88", telefone: "(11) 94444-2222", situacao: "Ativo" },
    { id: 104, nomeFantasia: "Log Brasil", cnpj: "11.223.344/0001-44", telefone: "(41) 99999-8888", situacao: "Inativo" },
    { id: 105, nomeFantasia: "Solar Energy", cnpj: "22.333.444/0001-55", telefone: "(71) 93333-6666", situacao: "Ativo" },
  ];

  const [filteredData, setFilteredData] = useState<Fornecedor[]>(fornecedores);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar model={novoFornecedor} dados={fornecedores} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default Page;
