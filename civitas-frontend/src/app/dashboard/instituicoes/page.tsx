"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { instituicaoService } from "@/hooks/instituicao";
import InstituicaoDTO from "@/models/instituicao";
import { SkeletonTable } from "@/components/skeleton";
// Usando o tipo do service

import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

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
  { id: "razaoSocial", label: "Razao Social" },
  { id: "cnpj", label: "CNPJ" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "telefone", label: "Telefone" },
  { id: "email", label: "E-mail" },
  { id: "situacao", label: "Situacao" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: [
      { value: "1", label: "Ativa" },
      { value: "0", label: "Inativa" },
    ],
  },
];

const instituicaoFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome da instituicao", required: true },
  {
    key: "razaoSocial",
    label: "Razao Social",
    placeholder: "Razao social da instituicao",
    required: true,
  },
  { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", required: true },
  { key: "cep", label: "CEP", placeholder: "00000-000", required: true },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  { key: "numero", label: "Numero", placeholder: "Numero", required: true },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
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
    label: "Situacao",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativa" },
      { value: "0", label: "Inativa" },
    ],
  },
];

const Page = () => {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredData, setFilteredData] = useState<Instituicao[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizePayload = (data: Partial<Instituicao> & Record<string, any>) => ({
    id: Number(data.id ?? 0),
    nome: data.nome ?? "",
    razaoSocial: data.razaoSocial ?? "",
    cnpj: data.cnpj ?? "",
    cep: data.cep ?? "",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    bairro: data.bairro ?? "",
    cidade: data.cidade ?? "",
    estado: data.estado ?? "",
    telefone: data.telefone ?? "",
    email: data.email ?? "",
    situacao: Number(data.situacao ?? 1),
  });

  const loadInstituicoes = async () => {
    try {
      setLoading(true);
      const list = await instituicaoService.getAll();
      setInstituicoes(list);
      setFilteredData(list);
      setError(null);
      return list;
    } catch (err) {
      console.error("Erro ao carregar instituicoes:", err);
      setInstituicoes([]);
      setFilteredData([]);
      setError("Nao foi possivel carregar instituicoes.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstituicoes();
  }, []);

  const handleCreate = async (novaInstituicaoData: Omit<Instituicao, "id">) => {
    try {
      const payload = normalizePayload({ ...novaInstituicaoData, id: 0 });
      await instituicaoService.create(payload);
      const list = await loadInstituicoes();
      return list[list.length - 1];
    } catch (err) {
      console.error("Erro ao criar instituicao:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Instituicao>) => {
    try {
      const atual = instituicoes.find((i) => Number(i.id) === Number(id));
      const payload = normalizePayload({ ...(atual ?? {}), ...dadosAtualizados, id });
      const updated = await instituicaoService.update(id, payload);
      const updatedData = instituicoes.map((i) => (Number(i.id) === Number(id) ? updated : i));
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar instituicao:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await instituicaoService.alterarSituacao(id);
      await loadInstituicoes();
    } catch (err) {
      console.error("Erro ao alterar situacao da instituicao:", err);
      throw err;
    }
  };

  if (loading) {
  return <SkeletonTable rows={5} cols={4} />;
}
    return <div>Carregando instituicoes...</div>;
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
