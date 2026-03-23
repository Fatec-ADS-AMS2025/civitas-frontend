"use client";

import React, { useEffect, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import {
  composeValidators,
  normalizeFornecedorPayload,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";
import { fornecedorService } from "@/hooks/fornecedor";
import FornecedorDTO from "@/models/fornecedor";
import { SkeletonTable } from "@/components/skeleton";
// Usando o tipo do service

import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

type Fornecedor = FornecedorDTO;
type FornecedorRow = Fornecedor & { situacaoLabel: string };

const novoFornecedor = {
  idFornecedor: 0,
  nomeFantasia: "",
  situacao: SITUACAO_ATIVO,
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
  { id: "situacaoLabel", label: "Situacao" },
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
    options: SITUACAO_OPTIONS,
  },
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
    label: "Razao Social / Nome",
    placeholder: "Nome ou razao social do fornecedor",
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
    validate: composeValidators(
      validateUfCode(),
      validateMaxLength("Estado", 2)
    ),
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
    label: "Situacao",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];

const mapFornecedorRows = (items: Fornecedor[]): FornecedorRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

const fetchFornecedorRows = async (): Promise<FornecedorRow[]> => {
  const items = await fornecedorService.getAll();
  return mapFornecedorRows(items);
};

export default function Page() {
  const [fornecedores, setFornecedores] = useState<FornecedorRow[]>([]);
  const [filteredData, setFilteredData] = useState<FornecedorRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFornecedores = async () => {
    const rows = await fetchFornecedorRows();
    setFornecedores(rows);
    setFilteredData(rows);
  };

  useEffect(() => {
    const loadFornecedores = async () => {
      try {
        setLoading(true);
        await refreshFornecedores();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err);
        setFornecedores([]);
        setFilteredData([]);
        setError(
          "Nao foi possivel carregar os fornecedores. Verifique o backend e tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadFornecedores();
  }, []);

  const handleCreate = async (novoFornecedorData: Omit<Fornecedor, "idFornecedor">) => {
    await fornecedorService.create(normalizeFornecedorPayload(novoFornecedorData));
    await refreshFornecedores();
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    await fornecedorService.update(
      id,
      normalizeFornecedorPayload(dadosAtualizados)
    );
    await refreshFornecedores();
  };

  const handleDelete = async (id: number) => {
    await fornecedorService.alterarSituacao(id);
    await refreshFornecedores();
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
