"use client";

import React, { useState } from "react";
import SearchBar from "@/components/Table/searchbar_Inst";
import Table from "@/components/Table/table_Sec";
import TableSecretarias from "@/components/Table/table_Sec";

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
    <main className="p-6 bg-gray-100 min-h-screen">

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#004D4D]">
          Listagem de Secretarias
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Home &lt; Secretarias &lt; Listagem
        </p>
      </div>

      {/* Tabela */}
      <Table data={filteredData} />

    </main>
  );
};

export default Page;
