"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { fornecedorService } from "@/hooks/fornecedor";
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
      { value: "1", label: "Ativo" },
      { value: "2", label: "Inativo" },
    ],
  },
];

const toFornecedorPayload = (data: Partial<Fornecedor>, id?: number): Fornecedor => ({
  idFornecedor: id ?? Number(data.idFornecedor ?? 0),
  nomeFantasia: String(data.nomeFantasia ?? ""),
  situacao: Number(data.situacao ?? 1),
  cnpj: String(data.cnpj ?? ""),
  nome: String(data.nome ?? ""),
  logradouro: String(data.logradouro ?? ""),
  numero: String(data.numero ?? ""),
  bairro: String(data.bairro ?? ""),
  cep: String(data.cep ?? ""),
  telefone: String(data.telefone ?? ""),
  email: String(data.email ?? ""),
  cidade: String(data.cidade ?? ""),
  estado: String(data.estado ?? ""),
});

export default function Page() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredData, setFilteredData] = useState<Fornecedor[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const list = await fornecedorService.getAllData();
      setFornecedores(list);
      setFilteredData(list);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
      setFornecedores([]);
      setFilteredData([]);
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
      const payload = toFornecedorPayload(novoFornecedorData, 0);
      const created = await fornecedorService.createData(payload);
      await loadFornecedores();
      return created;
    } catch (err) {
      console.error("Erro ao criar fornecedor:", err);
      throw err;
    }
  };

  // Função para atualizar fornecedor
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    try {
      const payload = toFornecedorPayload(dadosAtualizados, id);
      const updated = await fornecedorService.updateData(id, payload);
      await loadFornecedores();
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar fornecedor:", err);
      throw err;
    }
  };

  // Função para deletar fornecedor (via alteração de situação)
  const handleDelete = async (id: number) => {
    try {
      await fornecedorService.alterarSituacao(id);
      await loadFornecedores();
      return;
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