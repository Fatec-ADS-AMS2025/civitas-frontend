"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { instituicaoService} from "@/hooks/instituicao";
import InstituicaoDTO from "@/models/instituicao";

// Usando o tipo do service
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
  { id: "razaoSocial", label: "Razão Social" },
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

  // Carregar dados da API
  useEffect(() => {
    const loadInstituicoes = async () => {
      try {
        setLoading(true);
        const data: any = await instituicaoService.getAll();
        setInstituicoes(data.data);
        setFilteredData(data.data);
      } catch (err) {
        console.error('Erro ao carregar instituições:', err);
        setError('Erro ao carregar dados das instituições');
      } finally {
        setLoading(false);
      }
    };

    loadInstituicoes();
  }, []);

  // Função para criar nova instituição
  const handleCreate = async (novaInstituicaoData: Omit<Instituicao, 'id'>) => {
    try {
      const created = await instituicaoService.create(novaInstituicaoData);
      const updatedData = [...instituicoes, created];
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return created;
    } catch (err) {
      console.error('Erro ao criar instituição:', err);
      throw err;
    }
  };

  // Função para atualizar instituição
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Instituicao>) => {
    try {
      const updated = await instituicaoService.update(id, dadosAtualizados);
      const updatedData = instituicoes.map(i => i.id === id ? updated : i);
      setInstituicoes(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar instituição:', err);
      throw err;
    }
  };

  // Função para deletar instituição (via alteração de situação)
  const handleDelete = async (id: number) => {
    try {
      await instituicaoService.alterarSituacao(id);
      // Recarregar dados após alterar situação
      const data: any = await instituicaoService.getAll();
      setInstituicoes(data.data);
      setFilteredData(data.data);
    } catch (err) {
      console.error('Erro ao alterar situação da instituição:', err);
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
      {/* Barra de busca */}
      <SearchBar 
        model={novaInstituicao} 
        dados={instituicoes} 
        setDados={setFilteredData} 
        campos={campos} 
        setCampos={setCampos}
        onCadastrar={handleCreate}
      />

      {/* Tabela de resultados */}
      <Table 
        data={filteredData} 
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Page;
