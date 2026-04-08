"use client";

import React, { useEffect, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";
import {
  composeValidators,
  normalizeSecretariaPayload,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";
import { secretariaService } from "@/hooks/secretaria";
import SecretariaDTO from "@/models/secretaria";

type Secretaria = SecretariaDTO;
type SecretariaRow = Secretaria & { situacaoLabel: string };

const novaSecretaria = {
  idSecretaria: 0,
  situacao: SITUACAO_ATIVO,
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
  { id: "situacaoLabel", label: "Situacao" },
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
    options: SITUACAO_OPTIONS,
  },
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
    label: "Razao Social",
    placeholder: "Razao social da secretaria",
    required: true,
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
    validate: validateDigitsLength("CNPJ", 14),
  },
  {
    key: "descricao",
    label: "Descricao",
    placeholder: "Descricao da secretaria",
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
    label: "Numero",
    placeholder: "Numero",
    required: true,
    validate: validateMaxLength("Numero", 10),
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
    validate: validateDigitsLength("CEP", 8),
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
    validate: composeValidators(validateUfCode(), validateMaxLength("Estado", 2)),
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
    placeholder: "email@secretaria.gov.br",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];

const mapSecretariaRows = (items: Secretaria[]): SecretariaRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

const fetchSecretariaRows = async (): Promise<SecretariaRow[]> => {
  const items = await secretariaService.getAll();
  return mapSecretariaRows(items);
};

export default function Page() {
  const [secretarias, setSecretarias] = useState<SecretariaRow[]>([]);
  const [filteredData, setFilteredData] = useState<SecretariaRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSecretarias = async () => {
    const rows = await fetchSecretariaRows();
    setSecretarias(rows);
    setFilteredData(rows);
  };

  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoading(true);
        await refreshSecretarias();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar secretarias:", err);
        setSecretarias([]);
        setFilteredData([]);
        setError("Nao foi possivel carregar as secretarias. Verifique o backend e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    void loadSecretarias();
  }, []);

  const handleCreate = async (data: Omit<Secretaria, "idSecretaria">) => {
    await secretariaService.create(normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleUpdate = async (id: number, data: Partial<Secretaria>) => {
    await secretariaService.update(id, normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleDelete = async (id: number) => {
    await secretariaService.alterarSituacao(id);
    await refreshSecretarias();
  };

  if (loading) {
    return <SkeletonTable rows={5} cols={4} />;
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
        onDelete={handleDelete}
        formFields={secretariaFormFields}
      />
    </>
  );
}
