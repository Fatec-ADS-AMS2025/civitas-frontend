"use client";
import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
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

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matrícula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "tipo", label: "Tipo" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "matricula", placeholder: "Matrícula", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
  {
    key: "tipo",
    placeholder: "Tipo",
    local: "filtro",
    type: "select",
    options: [
      { value: "Administrador", label: "Administrador" },
      { value: "Cidadão", label: "Cidadão" },
      { value: "Funcionário", label: "Funcionário" },
    ],
  },
];

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
      id: 1,
      nome: "Ana Silva",
      cpf: "123.456.789-00",
      matricula: "ADM001",
      cidade: "São Paulo",
      estado: "SP",
      tipo: "Administrador",
    },
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
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar dados={usuarios} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default HomePage;