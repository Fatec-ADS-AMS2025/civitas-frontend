"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { orcamentoService } from "@/hooks/orcamento";
import OrcamentoDTO from "@/models/orcamento";

// Usando o tipo do service
type Orcamento = OrcamentoDTO;

const novoOrcamento: Orcamento = {
  idOrcamento: 0,
  ano: 0,
  valor: 0,
};

const columns = [
  { id: "idOrcamento", label: "ID Orçamento" },
  { id: "ano", label: "Ano" },
  { id: "valor", label: "Valor" },
];

const camposConst: FieldConfig[] = [
  { key: "ano", placeholder: "Ano", local: "principal" },
  { key: "valor", placeholder: "Valor", local: "principal" },
];

const Page = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filteredData, setFilteredData] = useState<Orcamento[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const loadOrcamentos = async () => {
      try {
        setLoading(true);
        const data: any = await orcamentoService.getAll();
        setOrcamentos(data.data);
        setFilteredData(data.data);
      } catch (err) {
        console.error('Erro ao carregar orçamentos:', err);
        setError('Erro ao carregar dados dos orçamentos');
      } finally {
        setLoading(false);
      }
    };

    loadOrcamentos();
  }, []);

  // Função para criar novo orçamento
  const handleCreate = async (novoOrcamentoData: Omit<Orcamento, 'idOrcamento'>) => {
    try {
      const created = await orcamentoService.create(novoOrcamentoData);
      const updatedData = [...orcamentos, created];
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return created;
    } catch (err) {
      console.error('Erro ao criar orçamento:', err);
      throw err;
    }
  };

  // Função para atualizar orçamento
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Orcamento>) => {
    try {
      const updated = await orcamentoService.update(id, dadosAtualizados);
      const updatedData = orcamentos.map(o => o.idOrcamento === id ? updated : o);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      throw err;
    }
  };

  // Função para deletar orçamento
  const handleDelete = async (id: number) => {
    try {
      await orcamentoService.delete(id);
      const updatedData = orcamentos.filter(o => o.idOrcamento !== id);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando orçamentos...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      {/* Barra de busca */}
      <SearchBar 
        model={novoOrcamento} 
        dados={orcamentos} 
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
