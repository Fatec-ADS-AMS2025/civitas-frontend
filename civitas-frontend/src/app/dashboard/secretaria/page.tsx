"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { secretariaService } from "@/hooks/secretaria";
import SecretariaDTO from "@/models/secretaria";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

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
  { id: "descricao", label: "Descricao" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacao", label: "Situacao" },
];

const camposConst: FieldConfig[] = [
  { key: "descricao", placeholder: "Descricao", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: [
      { value: "1", label: "Ativo" },
      { value: "0", label: "Inativo" },
    ],
  },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const secretariaFormFields: ModalFieldConfig[] = [
  { key: "idSecretaria", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome da secretaria", required: true },
  {
    key: "nomeRazaoSocial",
    label: "Razao Social",
    placeholder: "Razao social da secretaria",
    required: true,
  },
  { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", required: true },
  { key: "descricao", label: "Descricao", placeholder: "Descricao da secretaria", required: true },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  { key: "numero", label: "Numero", placeholder: "Numero", required: true },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  { key: "cep", label: "CEP", placeholder: "00000-000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", type: "tel" },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@secretaria.gov.br",
    type: "email",
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativo" },
      { value: "0", label: "Inativo" },
    ],
  },
];

export default function Page() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [filteredData, setFilteredData] = useState<Secretaria[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizePayload = (data: Partial<Secretaria> & Record<string, any>) => ({
    idSecretaria: Number(data.idSecretaria ?? 0),
    situacao: Number(data.situacao ?? 1),
    descricao: data.descricao ?? "",
    cnpj: data.cnpj ?? "",
    nome: data.nome ?? "",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    bairro: data.bairro ?? "",
    cep: data.cep ?? "",
    nomeRazaoSocial: data.nomeRazaoSocial ?? "",
    telefone: data.telefone ?? "",
    email: data.email ?? "",
    cidade: data.cidade ?? "",
    estado: data.estado ?? "",
  });

  const loadSecretarias = async () => {
    try {
      setLoading(true);
      const list = await secretariaService.getAll();
      setSecretarias(list);
      setFilteredData(list);
      setError(null);
      return list;
    } catch (err) {
      console.error("Erro ao carregar secretarias:", err);
      setSecretarias([]);
      setFilteredData([]);
      setError("Nao foi possivel carregar secretarias.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecretarias();
  }, []);

  const handleCreate = async (novaSecretariaData: Omit<Secretaria, "idSecretaria">) => {
    try {
      const payload = normalizePayload({ ...novaSecretariaData, idSecretaria: 0 });
      await secretariaService.create(payload);
      const list = await loadSecretarias();
      return list[list.length - 1];
    } catch (err) {
      console.error("Erro ao criar secretaria:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Secretaria>) => {
    try {
      const atual = secretarias.find((s) => Number(s.idSecretaria) === Number(id));
      const payload = normalizePayload({ ...(atual ?? {}), ...dadosAtualizados, idSecretaria: id });
      const updated = await secretariaService.update(id, payload);
      const updatedData = secretarias.map((s) =>
        Number(s.idSecretaria) === Number(id) ? updated : s
      );
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar secretaria:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await secretariaService.delete(id);
      const updatedData = secretarias.filter((s) => s.idSecretaria !== id);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
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
