"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { instituicaoService } from "@/hooks/instituicao";
import InstituicaoDTO from "@/models/instituicao";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

// Usando o tipo do service
type Instituicao = InstituicaoDTO;

const novaInstituicao: Instituicao = {
  id: 0,
  nome: "",
  nomeRazaoSocial: "",
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
  idTipoInstituicao: undefined,
  idSecretaria: undefined,
};

const validatePositiveInteger = (value: unknown, label: string): string | undefined => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return `${label} deve ser um numero inteiro maior que 0.`;
  }

  return undefined;
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "nomeRazaoSocial", label: "Razão Social" },
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
      { value: "1", label: "Ativa" },
      { value: "2", label: "Inativa" },
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
    key: "nomeRazaoSocial",
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
      { value: "1", label: "Ativa" },
      { value: "2", label: "Inativa" },
    ],
  },
  {
    key: "idTipoInstituicao",
    label: "ID Tipo Instituição",
    placeholder: "Informe o ID do tipo da instituição",
    required: true,
    type: "number",
    validate: (value) => validatePositiveInteger(value, "ID Tipo Instituição"),
  },
  {
    key: "idSecretaria",
    label: "ID Secretaria",
    placeholder: "Informe o ID da secretaria",
    required: true,
    type: "number",
    validate: (value) => validatePositiveInteger(value, "ID Secretaria"),
  },
];

const toInstituicaoPayload = (data: Partial<Instituicao>, id?: number): Partial<Instituicao> => {
  const idTipoInstituicao = Number(data.idTipoInstituicao);
  const idSecretaria = Number(data.idSecretaria);

  return {
    ...(id !== undefined ? { id } : {}),
    nome: String(data.nome ?? ""),
    nomeRazaoSocial: String(data.nomeRazaoSocial ?? ""),
    cnpj: String(data.cnpj ?? ""),
    cep: String(data.cep ?? ""),
    logradouro: String(data.logradouro ?? ""),
    numero: String(data.numero ?? ""),
    bairro: String(data.bairro ?? ""),
    cidade: String(data.cidade ?? ""),
    estado: String(data.estado ?? ""),
    telefone: String(data.telefone ?? ""),
    email: String(data.email ?? ""),
    situacao: Number(data.situacao ?? 1),
    idTipoInstituicao,
    idSecretaria,
  };
};

const Page = () => {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredData, setFilteredData] = useState<Instituicao[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInstituicoes = async () => {
    try {
      setLoading(true);
      const list = await instituicaoService.getAllData();
      setInstituicoes(list);
      setFilteredData(list);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar instituições:", err);
      setInstituicoes([]);
      setFilteredData([]);
      setError("Erro ao carregar dados das instituições");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInstituicoes();
  }, []);

  // Função para criar nova instituição
  const handleCreate = async (novaInstituicaoData: Omit<Instituicao, "id">) => {
    try {
      const payload = toInstituicaoPayload(novaInstituicaoData);

      if (!payload.idTipoInstituicao || !payload.idSecretaria) {
        throw new Error("Informe IDs validos para Tipo Instituicao e Secretaria (maiores que 0).");
      }

      const created = await instituicaoService.createData(payload);
      await loadInstituicoes();
      return created;
    } catch (err) {
      console.error("Erro ao criar instituição:", err);
      throw err;
    }
  };

  // Função para atualizar instituição
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Instituicao>) => {
    try {
      const payload = toInstituicaoPayload(dadosAtualizados, id);

      if (!payload.idTipoInstituicao || !payload.idSecretaria) {
        throw new Error("Informe IDs validos para Tipo Instituicao e Secretaria (maiores que 0).");
      }

      const updated = await instituicaoService.updateData(id, payload);
      await loadInstituicoes();
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar instituição:", err);
      throw err;
    }
  };

  // Função para deletar instituição (via alteração de situação)
  const handleDelete = async (id: number) => {
    try {
      await instituicaoService.alterarSituacao(id);
      await loadInstituicoes();
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
        formHiddenFields={["id"]}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={instituicaoFormFields}
        formHiddenFields={["id"]}
      />
    </>
  );
};

export default Page;