"use client";

import React, { useState } from "react";
import SearchBar from "@/components/Table/searchbar_Inst";
import Table from "@/components/Table/table_Inst";

type Instituicao = {
  id: number;
  nome: string;
  razao: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  num: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  situacao: "Ativa" | "Inativa";
};

const Page = () => {

  const instituicoes: Instituicao[] = [
    {
      id: 1,
      nome: "Fatec São",
      razao: "Centro Estadual...",
      cnpj: "12.345.678/0001-90",
      cep: "01124-069",
      logradouro: "Av.Tiradentes",
      num: "615",
      bairro: "Luz",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 80028-922",
      email: "fatec@sp.gov.br",
      situacao: "Ativa",
    },
    {
      id: 2,
      nome: "UNICAMP",
      razao: "Inst. Federal...",
      cnpj: "22.245.874/0001-20",
      cep: "01124-069",
      logradouro: "Av.Tiradedos",
      num: "617",
      bairro: "Butatã",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 80048-922",
      email: "unicamp@sp.gov.br",
      situacao: "Inativa",
    },
    {
      id: 3,
      nome: "Fatec Jales",
      razao: "Centro Estadual...",
      cnpj: "32.543.328/0001-21",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Jales",
      estado: "SP",
      telefone: "(11) 80028-022",
      email: "fatec@sp.gov.br",
      situacao: "Ativa",
    },
    {
      id: 4,
      nome: "UFAM",
      razao: "Inst. Federal...",
      cnpj: "32.145.981/0001-22",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Coari",
      estado: "AM",
      telefone: "(11) 80028-022",
      email: "ufam@gov.br",
      situacao: "Ativa",
    },
    {
      id: 5,
      nome: "UFMA",
      razao: "Inst. Federal...",
      cnpj: "29.842.667/0001-57",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Imperatriz",
      estado: "MA",
      telefone: "(11) 80028-022",
      email: "ufma@gov.br",
      situacao: "Inativa",
    },
    {
      id: 6,
      nome: "UFPI",
      razao: "Inst. Federal...",
      cnpj: "26.441.213/0001-88",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Paranaíba",
      estado: "PI",
      telefone: "(11) 80028-022",
      email: "ufpi@gov.br",
      situacao: "Ativa",
    },
    {
      id: 7,
      nome: "UFPE",
      razao: "Inst. Federal...",
      cnpj: "34.109.899/0001-04",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Caruaru",
      estado: "PE",
      telefone: "(11) 80028-022",
      email: "ufpe@gov.br",
      situacao: "Inativa",
    },
    {
      id: 8,
      nome: "UFMT",
      razao: "Inst. Federal...",
      cnpj: "38.901.200/0001-67",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "SINOP",
      estado: "MT",
      telefone: "(11) 80028-022",
      email: "ufmt@gov.br",
      situacao: "Ativa",
    },
    {
      id: 9,
      nome: "UFRJ",
      razao: "Inst. Federal...",
      cnpj: "40.201.932/0001-03",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      telefone: "(11) 80028-022",
      email: "ufrj@gov.br",
      situacao: "Ativa",
    },
    {
      id: 10,
      nome: "UFPel",
      razao: "Inst. Federal...",
      cnpj: "28.990.155/0001-42",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "Pelotas",
      estado: "RS",
      telefone: "(11) 80028-022",
      email: "ufpel@gov.br",
      situacao: "Inativa",
    },
    {
      id: 11,
      nome: "UFRS",
      razao: "Inst. Federal...",
      cnpj: "27.210.551/0001-12",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "P. Alegre",
      estado: "RS",
      telefone: "(11) 80028-022",
      email: "ufrs@gov.br",
      situacao: "Inativa",
    }
  ];

  const [filteredData, setFilteredData] =
    useState<Instituicao[]>(instituicoes);


  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const cleanCNPJ = (cnpj: string) => cnpj.replace(/\D/g, "");

  const handleSearch = (filters: any) => {

    const filtered = instituicoes.filter((inst) => {

      const nomeMatch =
        normalize(inst.nome).includes(normalize(filters.nome));

      const cnpjMatch =
        cleanCNPJ(inst.cnpj).includes(cleanCNPJ(filters.cnpj));

      const cidadeMatch =
        normalize(inst.cidade).includes(normalize(filters.cidade));

      const estadoMatch =
        normalize(inst.estado).includes(normalize(filters.estado));

      const situacaoMatch =
        filters.situacao ? inst.situacao === filters.situacao : true;

      return (
        nomeMatch &&
        cnpjMatch &&
        cidadeMatch &&
        estadoMatch &&
        situacaoMatch
      );
    });

    setFilteredData(filtered);
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#004D4D]">
          Listagem de Instituições
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Home &lt; Instituições &lt; Listagem
        </p>
      </div>

      {/* SearchBar */}
      <SearchBar onSearch={handleSearch} />

      {/* Tabela */}
      <Table data={filteredData} />

    </main>
  );
};

export default Page;
