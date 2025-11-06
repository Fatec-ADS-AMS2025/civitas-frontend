"use client";
import React, { useState } from "react";
import SearchBar from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
 
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
  {
    id: 5,
    nome: "Lucas Pereira",
    cpf: "111.222.333-44",
    matricula: "CID005",
    cidade: "Curitiba",
    estado: "PR",
    tipo: "Cidadão",
  },
  {
    id: 6,
    nome: "Fernanda Costa",
    cpf: "222.333.444-55",
    matricula: "ADM006",
    cidade: "Salvador",
    estado: "BA",
    tipo: "Administrador",
  },
  {
    id: 7,
    nome: "Ricardo Almeida",
    cpf: "333.444.555-66",
    matricula: "FUN007",
    cidade: "Fortaleza",
    estado: "CE",
    tipo: "Funcionário",
  },
  {
    id: 8,
    nome: "Juliana Rocha",
    cpf: "444.555.666-77",
    matricula: "CID008",
    cidade: "Porto Alegre",
    estado: "RS",
    tipo: "Cidadão",
  },
  {
    id: 9,
    nome: "Camila Nunes",
    cpf: "555.777.888-99",
    matricula: "FUN009",
    cidade: "Recife",
    estado: "PE",
    tipo: "Funcionário",
  },
  {
    id: 10,
    nome: "Bruno Martins",
    cpf: "666.888.999-00",
    matricula: "ADM010",
    cidade: "Brasília",
    estado: "DF",
    tipo: "Administrador",
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
<main className="p-6 bg-transparent min-h-screen">
<div className="mb-6">
<h1 className="text-4xl font-bold text-[#004D4D]">Listagem de Cadastros</h1>
<p className="text-sm text-gray-500 mt-1">Home &lt; Cadastros &lt; Listagem</p>
</div>
 
{/* Barra de busca */}
<SearchBar onSearch={handleSearch} />
 
{/* Tabela de resultados */}
<Table data={filteredData} />
</main>
);
};
 
export default HomePage;