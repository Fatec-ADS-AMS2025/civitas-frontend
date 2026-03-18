"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
// import { secretariaService } from "@/hooks/secretaria";
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
      { value: 1, label: "Ativo" },
      { value: 0, label: "Inativo" },
    ],
  },
];

export default function Page() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [filteredData, setFilteredData] = useState<Secretaria[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados fictícios para teste
  const dadosFicticios: Secretaria[] = [
    {
      idSecretaria: 1,
      situacao: 1,
      descricao: "Secretaria de Saúde",
      cnpj: "12.345.678/0001-01",
      nome: "Secretaria Municipal de Saúde",
      logradouro: "Av. Brasil",
      numero: "1200",
      bairro: "Centro",
      cep: "20000-000",
      nomeRazaoSocial: "Secretaria Municipal de Saúde",
      telefone: "(21) 99999-1111",
      email: "saude@prefeitura.gov.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
    {
      idSecretaria: 2,
      situacao: 1,
      descricao: "Secretaria de Educação",
      cnpj: "23.456.789/0001-02",
      nome: "Secretaria Municipal de Educação",
      logradouro: "Rua das Flores",
      numero: "450",
      bairro: "Copacabana",
      cep: "22000-000",
      nomeRazaoSocial: "Secretaria Municipal de Educação",
      telefone: "(21) 98888-2222",
      email: "educacao@prefeitura.gov.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
    {
      idSecretaria: 3,
      situacao: 0,
      descricao: "Secretaria de Transporte",
      cnpj: "34.567.890/0001-03",
      nome: "Secretaria Municipal de Transporte",
      logradouro: "Av. Presidente Vargas",
      numero: "980",
      bairro: "Centro",
      cep: "20010-000",
      nomeRazaoSocial: "Secretaria Municipal de Transporte",
      telefone: "(21) 97777-3333",
      email: "transporte@prefeitura.gov.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
    {
      idSecretaria: 4,
      situacao: 1,
      descricao: "Secretaria de Obras",
      cnpj: "45.678.901/0001-04",
      nome: "Secretaria Municipal de Obras",
      logradouro: "Rua do Catete",
      numero: "210",
      bairro: "Catete",
      cep: "22220-000",
      nomeRazaoSocial: "Secretaria Municipal de Obras",
      telefone: "(21) 96666-4444",
      email: "obras@prefeitura.gov.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
    {
      idSecretaria: 5,
      situacao: 1,
      descricao: "Secretaria de Assistência Social",
      cnpj: "56.789.012/0001-05",
      nome: "Secretaria Municipal de Assistência Social",
      logradouro: "Rua São José",
      numero: "300",
      bairro: "Centro",
      cep: "20010-020",
      nomeRazaoSocial: "Secretaria Municipal de Assistência Social",
      telefone: "(21) 95555-5555",
      email: "assistencia@prefeitura.gov.br",
      cidade: "Rio de Janeiro",
      estado: "RJ",
    },
  ];

  // Carregar dados da API
  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoading(true);

        // =========================
        // TESTE COM DADOS FICTÍCIOS
        // =========================
        setSecretarias(dadosFicticios);
        setFilteredData(dadosFicticios);
        setError(null);

        // =========================
        // CÓDIGO ORIGINAL DA API
        // =========================
        /*
        const data = await secretariaService.getAll();
        setSecretarias(data);
        setFilteredData(data);
        setError(null);
        */
      } catch (err) {
        console.error("Erro ao carregar secretarias:", err);
        setSecretarias([]);
        setFilteredData([]);
        setError("Não foi possível carregar secretarias. Verifique o backend e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadSecretarias();
  }, []);

  // Função para criar nova secretaria
  const handleCreate = async (novaSecretaria: Omit<Secretaria, "idSecretaria">) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const created: Secretaria = {
        ...novaSecretaria,
        idSecretaria:
          secretarias.length > 0
            ? Math.max(...secretarias.map((s) => s.idSecretaria)) + 1
            : 1,
      };

      const updatedData = [...secretarias, created];
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return created;
      // =========================

      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const created = await secretariaService.create(novaSecretaria);
      const updatedData = [...secretarias, created];
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return created;
      */
    } catch (err) {
      console.error("Erro ao criar secretaria:", err);
      throw err;
    }
  };

  // Função para atualizar secretaria
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Secretaria>) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = secretarias.map((s) =>
        s.idSecretaria === id ? { ...s, ...dadosAtualizados } : s
      );

      const updated = updatedData.find((s) => s.idSecretaria === id);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return updated;
      // =========================


      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const updated = await secretariaService.update(id, dadosAtualizados);
      const updatedData = secretarias.map(s => s.idSecretaria === id ? updated : s);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return updated;
      */
    } catch (err) {
      console.error("Erro ao atualizar secretaria:", err);
      throw err;
    }
  };

  // Função para deletar secretaria
  const handleDelete = async (id: number) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = secretarias.filter((s) => s.idSecretaria !== id);
      setSecretarias(updatedData);
      setFilteredData(updatedData);

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await secretariaService.delete(id);
      const updatedData = secretarias.filter(s => s.idSecretaria !== id);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      */
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
