"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { despesaService } from "@/hooks/despesa";
import DespesaDTO from "@/models/despesa";

type Despesa = DespesaDTO;

const novaDespesa: Despesa = {
  id: 0,
  descricao: "",
  valor: 0,
  data: "",
  categoria: "",
  situacao: 0,
};

const columns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descrição" },
  { id: "valor", label: "Valor" },
  { id: "data", label: "Data" },
  { id: "categoria", label: "Categoria" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "descricao", placeholder: "Descrição", local: "principal" },
  { key: "categoria", placeholder: "Categoria", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situação",
    local: "filtro",
    type: "select",
    options: [
      { value: "0", label: "Pendente" },
      { value: "1", label: "Aprovada" },
      { value: "2", label: "Rejeitada" },
    ],
  },
];

const Page = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filteredData, setFilteredData] = useState<Despesa[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDespesas = async () => {
      try {
        setLoading(true);
        const data: any = await despesaService.getAll();
        setDespesas(data.data);
        setFilteredData(data.data);
      } catch (err) {
        console.error("Erro ao carregar despesas:", err);
        setError("Erro ao carregar dados das despesas");
      } finally {
        setLoading(false);
      }
    };

    loadDespesas();
  }, []);

  const handleCreate = async (novaDespesaData: Omit<Despesa, "id">) => {
    try {
      const created = await despesaService.create(novaDespesaData);
      const updatedData = [...despesas, created];
      setDespesas(updatedData);
      setFilteredData(updatedData);
      return created;
    } catch (err) {
      console.error("Erro ao criar despesa:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Despesa>) => {
    try {
      const updated = await despesaService.update(id, dadosAtualizados);
      const updatedData = despesas.map((d) => (d.id === id ? updated : d));
      setDespesas(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar despesa:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await despesaService.delete(id);
      const updatedData = despesas.filter((d) => d.id !== id);
      setDespesas(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error("Erro ao deletar despesa:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando despesas...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      {/* Barra de busca */}
      <SearchBar
        model={novaDespesa}
        dados={despesas}
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

