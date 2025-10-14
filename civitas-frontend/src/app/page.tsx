"use client";
import React, { useState } from "react";
import Table from "../components/Table/table";
import SearchBar from "../components/Table/searchbar";

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

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const cleanCPF = (cpf: string) => cpf.replace(/\D/g, "");

  const handleSearch = (filters: {
    nome: string;
    cpf: string;
    cidade: string;
    estado: string;
    tipo: string;
  }) => {
    const { nome, cpf, cidade, estado, tipo } = filters;

    const filtered = usuarios.filter((u) => {
      const nomeMatch = normalizeString(u.nome).includes(normalizeString(nome));
      const cpfMatch = cleanCPF(u.cpf).includes(cleanCPF(cpf));
      const cidadeMatch = normalizeString(u.cidade).includes(normalizeString(cidade));
      const estadoMatch = normalizeString(u.estado).includes(normalizeString(estado));
      const tipoMatch = tipo ? u.tipo === tipo : true;
      return nomeMatch && cpfMatch && cidadeMatch && estadoMatch && tipoMatch;
    });

    setFilteredData(filtered);
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#004D4D]">Listagem de Cadastros</h1>
        <p className="text-sm text-gray-500 mt-1">Home &lt; Cadastros &lt; Listagem</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      <Table data={filteredData} />
    </main>
  );
};

export default HomePage;
