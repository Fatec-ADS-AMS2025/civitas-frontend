"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { secretariaService } from "@/hooks/secretaria";
import SecretariaDTO from "@/models/secretaria";

// Usando o tipo do service
type Secretaria = SecretariaDTO;

const novaSecretaria: Secretaria = {
  idSecretaria: 0,
  situacao: 1,
  descricao: '',
  cnpj: '',
  nome: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cep: '',
  nomeRazaoSocial: '',
  telefone: '',
  email: '',
  cidade: '',
  estado: '',
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

export default function Page() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [filteredData, setFilteredData] = useState<Secretaria[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoading(true);
        const res: any = await secretariaService.getAll();
        if(res === null) {
          throw new Error('Resposta nula da API');
        }
        if(!res.data) {
          throw new Error('Dados inválidos recebidos da API');
        }
        const data = res.data;
        console.log(data);
        setSecretarias(data);
        setFilteredData(data);
      } catch (err) {
        console.error('Erro ao carregar secretarias:', err);
        setError('Erro ao carregar dados das secretarias');
      } finally {
        setLoading(false);
      }
    };

    loadSecretarias();
  }, []);
  

  // Função para criar nova secretaria
  const handleCreate = async (novaSecretaria: Omit<Secretaria, 'idSecretaria'>) => {
    try {
      const created = await secretariaService.create(novaSecretaria);
      const updatedData = [...secretarias, created];
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return created;
    } catch (err) {
      console.error('Erro ao criar secretaria:', err);
      throw err;
    }
  };

  // Função para atualizar secretaria
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Secretaria>) => {
    try {
      const updated = await secretariaService.update(id, dadosAtualizados);
      const updatedData = secretarias.map(s => s.idSecretaria === id ? updated : s);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar secretaria:', err);
      throw err;
    }
  };

  // Função para deletar secretaria
  const handleDelete = async (id: number) => {
    try {
      await secretariaService.delete(id);
      const updatedData = secretarias.filter(s => s.idSecretaria !== id);
      setSecretarias(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error('Erro ao deletar secretaria:', err);
      throw err;
    }
  };

  // Função para alterar situação
  const handleAlterarSituacao = async (id: number) => {
    try {
      await secretariaService.alterarSituacao(id);
      // Recarregar dados após alterar situação
      const data = await secretariaService.getAll();
      setSecretarias(data);
      setFilteredData(data);
    } catch (err) {
      console.error('Erro ao alterar situação:', err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando secretarias...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      {/* Barra de busca */}
      <SearchBar 
        model={novaSecretaria} 
        dados={secretarias} 
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
