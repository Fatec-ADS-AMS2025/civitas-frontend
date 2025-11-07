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
      nome: "Fatec São Paulo",
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
      cnpj: "12.345.879/0001-90",
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
      cnpj: "32.345.678/0001-90",
      cep: "01124-069",
      logradouro: "Av.Tirape",
      num: "619",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 80028-022",
      email: "fatec@sp.gov.br",
      situacao: "Ativa",
    },
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
