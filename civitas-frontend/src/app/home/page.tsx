"use client";
import React, { useState } from "react";
import Table from "../../components/Table/table";
import SearchBar from "../../components/SearchBar/searchbar";

type User = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  tipo: "Administrador" | "Cidadão" | "Funcionário";
};

const HomePage = () => {
  const usuarios: User[] = [
    {
      id: 1,
      nome: "Ana Silva",
      cpf: "123.456.789-00",
      matricula: "ADM001",
      cidade: "São Paulo",
      estado: "SP",
      tipo: "Administrador",
    },
    {
      id: 2,
      nome: "João Santos",
      cpf: "987.654.321-11",
      matricula: "CID002",
      cidade: "Belo Horizonte",
      estado: "MG",
      tipo: "Cidadão",
    },
    {
      id: 3,
      nome: "Maria Oliveira",
      cpf: "456.789.123-22",
      matricula: "FUN003",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      tipo: "Funcionário",
    },
    {
      id: 4,
      nome: "Pedro Lima",
      cpf: "555.666.777-88",
      matricula: "FUN004",
      cidade: "São Paulo",
      estado: "SP",
      tipo: "Funcionário",
    },
  ];

  const [filteredData, setFilteredData] = useState<User[]>(usuarios);

  return (
    <main className="p-6 bg-gray-100 min-h-screen">

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#004D4D]">Listagem de Cadastros</h1>
        <p className="text-sm text-gray-500 mt-1">Home &lt; Cadastros &lt; Listagem</p>
      </div>

      <SearchBar
        data={usuarios}
        onSearch={(results) => {
          setFilteredData(results);
        }}
        onCadastrar={() => {
          // substitua por router.push("/cadastro") se quiser navegar
          alert("Ir para tela de cadastro (troque para router.push)");
        }}
      />

      {/* Tabela */}
      <Table data={filteredData} />
    </main>
  );
};

export default HomePage;
