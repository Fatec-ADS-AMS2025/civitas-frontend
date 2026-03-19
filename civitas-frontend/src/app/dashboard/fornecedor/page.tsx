"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { fornecedorService } from "@/hooks/fornecedor";
import FornecedorDTO from "@/models/fornecedor";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

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
  { id: "situacao", label: "Situacao" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: [
      { value: "1", label: "Ativo" },
      { value: "2", label: "Inativo" },
    ],
  },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const fornecedorFormFields: ModalFieldConfig[] = [
  { key: "idFornecedor", hidden: true },
  { key: "nomeFantasia", label: "Nome Fantasia", placeholder: "Nome fantasia", required: true },
  { key: "nome", label: "Razao Social / Nome", placeholder: "Nome ou razao social", required: true },
  { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", required: true },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  { key: "numero", label: "Numero", placeholder: "Numero", required: true },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  { key: "cep", label: "CEP", placeholder: "00000-000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", type: "tel", required: true },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@fornecedor.com.br",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativo" },
      { value: "2", label: "Inativo" },
    ],
  },
];

export default function Page() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredData, setFilteredData] = useState<Fornecedor[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeSituacaoForApi = (value: unknown): number => {
    const n = Number(value);
    if (n === 2) return 2;
    return 1;
  };

  const normalizePayload = (data: Partial<Fornecedor> & Record<string, any>) => ({
    idFornecedor: Number(data.idFornecedor ?? 0),
    nomeFantasia: data.nomeFantasia ?? "",
    situacao: normalizeSituacaoForApi(data.situacao),
    cnpj: data.cnpj ?? "",
    nome: data.nome ?? "",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    bairro: data.bairro ?? "",
    cep: data.cep ?? "",
    telefone: data.telefone ?? "",
    email: data.email ?? "",
    cidade: data.cidade ?? "",
    estado: data.estado ?? "",
  });

  const normalizeCreatePayload = (data: Partial<Fornecedor> & Record<string, any>) => ({
    nomeFantasia: data.nomeFantasia ?? "",
    situacao: normalizeSituacaoForApi(data.situacao),
    cnpj: data.cnpj ?? "",
    nome: data.nome ?? "",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    bairro: data.bairro ?? "",
    cep: data.cep ?? "",
    telefone: data.telefone ?? "",
    email: data.email ?? "",
    cidade: data.cidade ?? "",
    estado: data.estado ?? "",
  });

  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const list = await fornecedorService.getAll();
      setFornecedores(list);
      setFilteredData(list);
      setError(null);
      return list;
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
      setFornecedores([]);
      setFilteredData([]);
      setError("Nao foi possivel carregar fornecedores.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFornecedores();
  }, []);

  const handleCreate = async (novoFornecedorData: Omit<Fornecedor, "idFornecedor">) => {
    try {
      const payload = normalizeCreatePayload(novoFornecedorData as any);
      await fornecedorService.create(payload);
      const list = await loadFornecedores();
      return list[list.length - 1];
    } catch (err) {
      console.error("Erro ao criar fornecedor:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    try {
      const atual = fornecedores.find((f) => Number(f.idFornecedor) === Number(id));
      const payload = normalizePayload({ ...(atual ?? {}), ...dadosAtualizados, idFornecedor: id });
      const updated = await fornecedorService.update(id, payload);
      const updatedData = fornecedores.map((f) =>
        Number(f.idFornecedor) === Number(id) ? updated : f
      );
      setFornecedores(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar fornecedor:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fornecedorService.alterarSituacao(id);
      await loadFornecedores();
    } catch (err) {
      console.error("Erro ao alterar situacao do fornecedor:", err);
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
