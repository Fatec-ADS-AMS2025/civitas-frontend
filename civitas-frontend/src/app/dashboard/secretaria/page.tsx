"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { secretariaService } from "@/hooks/secretaria";
import SecretariaDTO from "@/models/secretaria";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

// Usando o tipo do service
type Secretaria = SecretariaDTO;

const novaSecretaria: Secretaria = {
  idSecretaria: 0,
  situacao: 1,
  descricao: "",
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  nomeRazaoSocial: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

const columns = [
  { id: "idSecretaria", label: "ID Secretaria" },
  { id: "descricao", label: "Descrição" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "descricao", placeholder: "Descrição", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  { key: "situacao", placeholder: "Situação", local: "principal" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const secretariaFormFields: ModalFieldConfig[] = [
  { key: "idSecretaria", hidden: true },

  {
    key: "nome",
    label: "Nome",
    placeholder: "Nome da secretaria",
    required: true,
  },

  {
    key: "nomeRazaoSocial",
    label: "Razão Social",
    placeholder: "Razão social da secretaria",
    required: true,
  },

  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
  },

  {
    key: "descricao",
    label: "Descrição",
    placeholder: "Descrição da secretaria",
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
  },

  {
    key: "email",
    label: "E-mail",
    placeholder: "email@secretaria.gov.br",
    type: "email",
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

const toSecretariaPayload = (data: Partial<Secretaria>, id?: number): Secretaria => ({
  idSecretaria: id ?? Number(data.idSecretaria ?? 0),
  situacao: Number(data.situacao ?? 1),
  descricao: String(data.descricao ?? ""),
  cnpj: String(data.cnpj ?? ""),
  nome: String(data.nome ?? ""),
  logradouro: String(data.logradouro ?? ""),
  numero: String(data.numero ?? ""),
  bairro: String(data.bairro ?? ""),
  cep: String(data.cep ?? ""),
  nomeRazaoSocial: String(data.nomeRazaoSocial ?? ""),
  telefone: String(data.telefone ?? ""),
  email: String(data.email ?? ""),
  cidade: String(data.cidade ?? ""),
  estado: String(data.estado ?? ""),
});

export default function Page() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [filteredData, setFilteredData] = useState<Secretaria[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSecretarias = async () => {
    try {
      setLoading(true);
      const list = await secretariaService.getAllData();
      setSecretarias(list);
      setFilteredData(list);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar secretarias:", err);
      setSecretarias([]);
      setFilteredData([]);
      setError("Não foi possível carregar secretarias. Verifique o backend e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSecretarias();
  }, []);

  // Função para criar nova secretaria
  const handleCreate = async (novaSecretaria: Omit<Secretaria, "idSecretaria">) => {
    try {
      const payload = toSecretariaPayload(novaSecretaria, 0);
      const created = await secretariaService.createData(payload);
      await loadSecretarias();
      return created;
    } catch (err) {
      console.error("Erro ao criar secretaria:", err);
      throw err;
    }
  };

  // Função para atualizar secretaria
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Secretaria>) => {
    try {
      const payload = toSecretariaPayload(dadosAtualizados, id);
      const updated = await secretariaService.updateData(id, payload);
      await loadSecretarias();
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar secretaria:", err);
      throw err;
    }
  };

  // Função para deletar secretaria
  const handleDelete = async (id: number) => {
    try {
      await secretariaService.alterarSituacao(id);
      await loadSecretarias();
    } catch (err) {
      console.error("Erro ao deletar secretaria:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando secretarias...</div>;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={novaSecretaria}
        dados={secretarias}
        setDados={setFilteredData}
        campos={campos}
        formFields={secretariaFormFields}
        setCampos={setCampos}
        onCadastrar={handleCreate}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        formFields={secretariaFormFields}
        onDelete={handleDelete}
      />
    </>
  );
}