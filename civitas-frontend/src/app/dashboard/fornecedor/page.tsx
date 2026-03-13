"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { fornecedorService } from "@/hooks/fornecedor";
import FornecedorDTO from "@/models/fornecedor";

// Usando o tipo do service
type Fornecedor = FornecedorDTO;

const novoFornecedor: Fornecedor = {
  idFornecedor: 0,
  nomeFantasia: '',
  situacao: 1,
  cnpj: '',
  nome: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cep: '',
  telefone: '',
  email: '',
  cidade: '',
  estado: '',
};

const columns = [
  { id: "idFornecedor", label: "ID Orçamento" },
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


export default function Page() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredData, setFilteredData] = useState<Fornecedor[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const data: any = await fornecedorService.getAll();
      setFornecedores(data.data);
      setFilteredData(data.data);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
      setError('Erro ao carregar dados dos fornecedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFornecedores();
  }, []);

  // Função para criar novo fornecedor
  const handleCreate = async (novoFornecedorData: Omit<Fornecedor, 'idFornecedor'>) => {
    try {
      await fornecedorService.create(novoFornecedorData);
      await loadFornecedores();
      return;
    } catch (err) {
      console.error('Erro ao criar fornecedor:', err);
      throw err;
    }
  };

  // Função para atualizar fornecedor
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    try {
      await fornecedorService.update(id, dadosAtualizados);
      await loadFornecedores();
      return;
    } catch (err) {
      console.error('Erro ao atualizar fornecedor:', err);
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
      console.error('Erro ao alterar situação do fornecedor:', err);
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
      {/* Barra de busca */}
      <SearchBar
        model={novoFornecedor}
        dados={fornecedores}
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

}
