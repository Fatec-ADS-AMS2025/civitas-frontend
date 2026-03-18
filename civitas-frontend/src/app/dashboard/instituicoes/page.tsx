"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
// import { instituicaoService } from "@/hooks/instituicao";
import InstituicaoDTO from "@/models/instituicao";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

// Usando o tipo do service
type Instituicao = InstituicaoDTO;

const novaInstituicao: Instituicao = {
  id: 0,
  nome: "",
  razaoSocial: "",
  cnpj: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  situacao: 1,
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "razaoSocial", label: "Razão Social" },
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
      { value: 1, label: "Ativa" },
      { value: 0, label: "Inativa" },
    ],
  },
];

const instituicaoFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },

  {
    key: "nome",
    label: "Nome",
    placeholder: "Nome da instituição",
    required: true,
  },
  {
    key: "razaoSocial",
    label: "Razão Social",
    placeholder: "Razão social da instituição",
    required: true,
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
  },
  {
    key: "cep",
    label: "CEP",
    placeholder: "00000-000",
    required: true,
  },
  {
    key: "logradouro",
    label: "Logradouro",
    placeholder: "Rua / Avenida",
    required: true,
  },
  {
    key: "numero",
    label: "Número",
    placeholder: "Número",
    required: true,
  },
  {
    key: "bairro",
    label: "Bairro",
    placeholder: "Bairro",
    required: true,
  },
  {
    key: "cidade",
    label: "Cidade",
    placeholder: "Cidade",
    required: true,
  },
  {
    key: "estado",
    label: "Estado",
    placeholder: "UF",
    required: true,
  },
  {
    key: "telefone",
    label: "Telefone",
    placeholder: "(00) 00000-0000",
    type: "tel",
    required: true,
  },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@instituicao.com",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situação",
    type: "select",
    required: true,
    options: [
      { value: 1, label: "Ativa" },
      { value: 0, label: "Inativa" },
    ],
  },
];

const Page = () => {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredData, setFilteredData] = useState<Instituicao[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados fictícios para teste
  const dadosFicticios: Instituicao[] = [
    {
      id: 1,
      nome: "Instituto Alfa",
      razaoSocial: "Instituto Alfa de Ensino LTDA",
      cnpj: "12.345.678/0001-10",
      cep: "01001-000",
      logradouro: "Rua das Palmeiras",
      numero: "100",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "(11) 99999-1111",
      email: "contato@institutoalfa.com.br",
      situacao: 1,
    },
    {
      id: 2,
      nome: "Faculdade Horizonte",
      razaoSocial: "Faculdade Horizonte Educacional LTDA",
      cnpj: "23.456.789/0001-20",
      cep: "20040-020",
      logradouro: "Av. Rio Branco",
      numero: "250",
      bairro: "Centro",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      telefone: "(21) 98888-2222",
      email: "atendimento@horizonte.edu.br",
      situacao: 1,
    },
    {
      id: 3,
      nome: "Centro Técnico Brasil",
      razaoSocial: "Centro Técnico Brasil Serviços Educacionais LTDA",
      cnpj: "34.567.890/0001-30",
      cep: "30130-110",
      logradouro: "Rua da Bahia",
      numero: "780",
      bairro: "Lourdes",
      cidade: "Belo Horizonte",
      estado: "MG",
      telefone: "(31) 97777-3333",
      email: "secretaria@ctbrasil.com.br",
      situacao: 0,
    },
    {
      id: 4,
      nome: "Colégio Evolução",
      razaoSocial: "Colégio Evolução Integral LTDA",
      cnpj: "45.678.901/0001-40",
      cep: "80010-000",
      logradouro: "Rua XV de Novembro",
      numero: "430",
      bairro: "Centro",
      cidade: "Curitiba",
      estado: "PR",
      telefone: "(41) 96666-4444",
      email: "contato@evolucao.edu.br",
      situacao: 1,
    },
    {
      id: 5,
      nome: "Universidade Litoral",
      razaoSocial: "Universidade Litoral do Sul LTDA",
      cnpj: "56.789.012/0001-50",
      cep: "88010-200",
      logradouro: "Av. Beira Mar Norte",
      numero: "1500",
      bairro: "Centro",
      cidade: "Florianópolis",
      estado: "SC",
      telefone: "(48) 95555-5555",
      email: "reitoria@ulitoral.edu.br",
      situacao: 1,
    },
  ];

  // Carregar dados da API
  useEffect(() => {
    const loadInstituicoes = async () => {
      try {
        setLoading(true);

        // =========================
        // TESTE COM DADOS FICTÍCIOS
        // =========================
        setInstituicoes(dadosFicticios);
        setFilteredData(dadosFicticios);
        setError(null);

        // =========================
        // CÓDIGO ORIGINAL DA API
        // =========================
        /*
        const data: any = await instituicaoService.getAll();
        setInstituicoes(data.data);
        setFilteredData(data.data);
        */
      } catch (err) {
        console.error("Erro ao carregar instituições:", err);
        setError("Erro ao carregar dados das instituições");
      } finally {
        setLoading(false);
      }
    };

    loadInstituicoes();
  }, []);

  // Função para criar nova instituição
  const handleCreate = async (novaInstituicaoData: Omit<Instituicao, "id">) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const created: Instituicao = {
        ...novaInstituicaoData,
        id: instituicoes.length > 0 ? Math.max(...instituicoes.map((i) => i.id)) + 1 : 1,
      };

      const updatedData = [...instituicoes, created];
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return created;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const created = await instituicaoService.create(novaInstituicaoData);
      const updatedData = [...instituicoes, created];
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return created;
      */
    } catch (err) {
      console.error("Erro ao criar instituição:", err);
      throw err;
    }
  };

  // Função para atualizar instituição
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Instituicao>) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = instituicoes.map((i) =>
        i.id === id ? { ...i, ...dadosAtualizados } : i
      );

      const updated = updatedData.find((i) => i.id === id);
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return updated;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const updated = await instituicaoService.update(id, dadosAtualizados);
      const updatedData = instituicoes.map(i => i.id === id ? updated : i);
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return updated;
      */
    } catch (err) {
      console.error("Erro ao atualizar instituição:", err);
      throw err;
    }
  };

  // Função para deletar instituição (via alteração de situação)
  const handleDelete = async (id: number) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = instituicoes.map((i) =>
        i.id === id
          ? { ...i, situacao: i.situacao === 1 ? 0 : 1 }
          : i
      );

      setInstituicoes(updatedData);
      setFilteredData(updatedData);

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await instituicaoService.alterarSituacao(id);
      const data: any = await instituicaoService.getAll();
      setInstituicoes(data.data);
      setFilteredData(data.data);
      */
    } catch (err) {
      console.error("Erro ao alterar situação da instituição:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando instituições...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      <SearchBar
        model={novaInstituicao}
        dados={instituicoes}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={instituicaoFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={instituicaoFormFields}
      />
    </>
  );
};

export default Page;
