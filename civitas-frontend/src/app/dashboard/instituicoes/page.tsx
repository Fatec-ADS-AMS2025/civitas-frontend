"use client";
import React, { useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";

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

const novaInstituicao: Instituicao = {
  id: 0,
  nome: "",
  razao: "",
  cnpj: "",
  cep: "",
  logradouro: "",
  num: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  situacao: "Ativa",
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "razao", label: "Razão Social" },
  { id: "cnpj", label: "CNPJ" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "telefone", label: "Telefone" },
  { id: "email", label: "E-mail" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
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

  const [filteredData, setFilteredData] = useState<Instituicao[]>(instituicoes);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  return (
    <>
      {/* Barra de busca */}
      <SearchBar model={novaInstituicao} dados={instituicoes} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default Page;
