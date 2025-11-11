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
  ];

  const [filteredData, setFilteredData] = useState<Secretaria[]>(secretarias);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar dados={usuarios} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default Page;
