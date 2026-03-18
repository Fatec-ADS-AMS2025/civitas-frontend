"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
// import { fornecedorService } from "@/hooks/fornecedor";
import FornecedorDTO from "@/models/fornecedor";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

// Usando o tipo do service
type Fornecedor = FornecedorDTO;

const novoFornecedor: Fornecedor = {
  idFornecedor: 0,
  nomeFantasia: "",
  situacao: 1,
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

const columns = [
  { id: "idFornecedor", label: "ID Fornecedor" },
  { id: "nomeFantasia", label: "Nome Fantasia" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  { key: "situacao", placeholder: "Situação", local: "principal" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const fornecedorFormFields: ModalFieldConfig[] = [
  { key: "idFornecedor", hidden: true },

  {
    key: "nomeFantasia",
    label: "Nome Fantasia",
    placeholder: "Nome fantasia do fornecedor",
    required: true,
  },
  {
    key: "nome",
    label: "Razão Social / Nome",
    placeholder: "Nome ou razão social do fornecedor",
    required: true,
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
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
    key: "cep",
    label: "CEP",
    placeholder: "00000-000",
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
    placeholder: "email@fornecedor.com.br",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situação",
    type: "select",
    required: true,
    options: [
      { value: 1, label: "Ativo" },
      { value: 0, label: "Inativo" },
    ],
  },
];

export default function Page() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredData, setFilteredData] = useState<Fornecedor[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dadosFicticios: Fornecedor[] = [
    {
      idFornecedor: 1,
      nomeFantasia: "Alpha Distribuidora",
      situacao: 1,
      cnpj: "12.345.678/0001-11",
      nome: "Alpha Distribuidora LTDA",
      logradouro: "Rua das Indústrias",
      numero: "120",
      bairro: "Centro",
      cep: "01010-000",
      telefone: "(11) 99999-1111",
      email: "contato@alpha.com.br",
      cidade: "São Paulo",
      estado: "SP",
    },
    {
      idFornecedor: 2,
      nomeFantasia: "Comercial Beta",
      situacao: 1,
      cnpj: "23.456.789/0001-22",
      nome: "Comercial Beta LTDA",
      logradouro: "Av. Brasil",
      numero: "450",
      bairro: "Centro",
      cep: "20040-100",
      telefone: "(21) 98888-2222",
      email: "vendas@beta.com.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
    {
      idFornecedor: 3,
      nomeFantasia: "Gamma Suprimentos",
      situacao: 0,
      cnpj: "34.567.890/0001-33",
      nome: "Gamma Suprimentos ME",
      logradouro: "Rua Bahia",
      numero: "780",
      bairro: "Funcionários",
      cep: "30160-011",
      telefone: "(31) 97777-3333",
      email: "contato@gamma.com.br",
      cidade: "Belo Horizonte",
      estado: "MG",
    },
    {
      idFornecedor: 4,
      nomeFantasia: "Delta Materiais",
      situacao: 1,
      cnpj: "45.678.901/0001-44",
      nome: "Delta Materiais LTDA",
      logradouro: "Rua XV de Novembro",
      numero: "230",
      bairro: "Centro",
      cep: "80020-310",
      telefone: "(41) 96666-4444",
      email: "atendimento@delta.com.br",
      cidade: "Curitiba",
      estado: "PR",
    },
    {
      idFornecedor: 5,
      nomeFantasia: "Omega Serviços",
      situacao: 1,
      cnpj: "56.789.012/0001-55",
      nome: "Omega Serviços Empresariais LTDA",
      logradouro: "Av. Beira Mar",
      numero: "1500",
      bairro: "Centro",
      cep: "88015-400",
      telefone: "(48) 95555-5555",
      email: "contato@omega.com.br",
      cidade: "Florianópolis",
      estado: "SC",
    },
  ];

  const loadFornecedores = async () => {
    try {
      setLoading(true);

      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      setFornecedores(dadosFicticios);
      setFilteredData(dadosFicticios);
      setError(null);

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const data: any = await fornecedorService.getAll();
      setFornecedores(data.data);
      setFilteredData(data.data);
      */
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
      setError("Erro ao carregar dados dos fornecedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFornecedores();
  }, []);

  // Função para criar novo fornecedor
  const handleCreate = async (novoFornecedorData: Omit<Fornecedor, "idFornecedor">) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const created: Fornecedor = {
        ...novoFornecedorData,
        situacao: Number((novoFornecedorData as any).situacao) === 0 ? 0 : 1,
        idFornecedor:
          fornecedores.length > 0
            ? Math.max(...fornecedores.map((f) => f.idFornecedor)) + 1
            : 1,
      };

      const updatedData = [...fornecedores, created];
      setFornecedores(updatedData);
      setFilteredData(updatedData);
      return created;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await fornecedorService.create(novoFornecedorData);
      await loadFornecedores();
      return;
      */
    } catch (err) {
      console.error("Erro ao criar fornecedor:", err);
      throw err;
    }
  };

  // Função para atualizar fornecedor
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const dadosNormalizados: Partial<Fornecedor> = {
        ...dadosAtualizados,
        ...(dadosAtualizados.situacao !== undefined
          ? { situacao: Number(dadosAtualizados.situacao) === 0 ? 0 : 1 }
          : {}),
      };

      const updatedData = fornecedores.map((f) =>
        f.idFornecedor === id ? { ...f, ...dadosNormalizados } : f
      );

      const updated = updatedData.find((f) => f.idFornecedor === id);
      setFornecedores(updatedData);
      setFilteredData(updatedData);
      return updated;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await fornecedorService.update(id, dadosAtualizados);
      await loadFornecedores();
      return;
      */
    } catch (err) {
      console.error("Erro ao atualizar fornecedor:", err);
      throw err;
    }
  };

  // Função para deletar fornecedor (via alteração de situação)
  const handleDelete = async (id: number) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = fornecedores.map((f) =>
        f.idFornecedor === id
          ? { ...f, situacao: f.situacao === 1 ? 0 : 1 }
          : f
      );

      setFornecedores(updatedData);
      setFilteredData(updatedData);
      return;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await fornecedorService.alterarSituacao(id);
      await loadFornecedores();
      return;
      */
    } catch (err) {
      console.error("Erro ao alterar situação do fornecedor:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando fornecedores...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      <SearchBar
        model={novoFornecedor}
        dados={fornecedores}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={fornecedorFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={fornecedorFormFields}
      />
    </>
  );
}
