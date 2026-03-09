"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
// import { orcamentoService } from "@/hooks/orcamento";
import OrcamentoDTO from "@/models/orcamento";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

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

const orcamentoFormFields: ModalFieldConfig[] = [
  { key: "idOrcamento", hidden: true },
  {
    key: "ano",
    label: "Ano",
    placeholder: "Digite o ano",
    required: true,
    type: "number",
  },
  {
    key: "valor",
    label: "Valor",
    placeholder: "Digite o valor do orçamento",
    required: true,
    type: "number",
  },
];

const Page = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filteredData, setFilteredData] = useState<Orcamento[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados fictícios para teste
  const dadosFicticios: Orcamento[] = [
    {
      idOrcamento: 1,
      ano: 2022,
      valor: 150000,
    },
    {
      idOrcamento: 2,
      ano: 2023,
      valor: 275500,
    },
    {
      idOrcamento: 3,
      ano: 2024,
      valor: 320000,
    },
    {
      idOrcamento: 4,
      ano: 2025,
      valor: 410750,
    },
    {
      idOrcamento: 5,
      ano: 2026,
      valor: 525900,
    },
  ];

  // Carregar dados da API
  useEffect(() => {
    const loadOrcamentos = async () => {
      try {
        setLoading(true);

        // =========================
        // TESTE COM DADOS FICTÍCIOS
        // =========================
        setOrcamentos(dadosFicticios);
        setFilteredData(dadosFicticios);
        setError(null);

        // =========================
        // CÓDIGO ORIGINAL DA API
        // =========================
        /*
        const data: any = await orcamentoService.getAll();
        setOrcamentos(data.data);
        setFilteredData(data.data);
        */
      } catch (err) {
        console.error("Erro ao carregar orçamentos:", err);
        setError("Erro ao carregar dados dos orçamentos");
      } finally {
        setLoading(false);
      }
    };

    loadOrcamentos();
  }, []);

  // Função para criar novo orçamento
  const handleCreate = async (novoOrcamentoData: Omit<Orcamento, "idOrcamento">) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const created: Orcamento = {
        ...novoOrcamentoData,
        idOrcamento:
          orcamentos.length > 0
            ? Math.max(...orcamentos.map((o) => o.idOrcamento)) + 1
            : 1,
      };

      const updatedData = [...orcamentos, created];
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return created;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const created = await orcamentoService.create(novoOrcamentoData);
      const updatedData = [...orcamentos, created];
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return created;
      */
    } catch (err) {
      console.error("Erro ao criar orçamento:", err);
      throw err;
    }
  };

  // Função para atualizar orçamento
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Orcamento>) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = orcamentos.map((o) =>
        o.idOrcamento === id ? { ...o, ...dadosAtualizados } : o
      );

      const updated = updatedData.find((o) => o.idOrcamento === id);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return updated;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const updated = await orcamentoService.update(id, dadosAtualizados);
      const updatedData = orcamentos.map(o => o.idOrcamento === id ? updated : o);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return updated;
      */
    } catch (err) {
      console.error("Erro ao atualizar orçamento:", err);
      throw err;
    }
  };

  // Função para deletar orçamento
  const handleDelete = async (id: number) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = orcamentos.filter((o) => o.idOrcamento !== id);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await orcamentoService.delete(id);
      const updatedData = orcamentos.filter(o => o.idOrcamento !== id);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      */
    } catch (err) {
      console.error("Erro ao deletar orçamento:", err);
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
      <SearchBar
        model={novoOrcamento}
        dados={orcamentos}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={orcamentoFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={orcamentoFormFields}
      />
    </>
  );
};

export default Page;