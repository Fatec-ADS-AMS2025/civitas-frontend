"use client";
import React, { useEffect, useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { fornecedorService } from "@/hooks/fornecedor";
import FornecedorDTO from "@/models/fornecedor";

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
  { id: "idFornecedor", label: "ID Fornecedor" },
  { id: "nomeFantasia", label: "Nome Fantasia" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  { key: "situacao", placeholder: "Situação", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const Page = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredData, setFilteredData] = useState<Fornecedor[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFornecedores = async () => {
      try {
        setLoading(true);
        const data: any = await fornecedorService.getAll();
        const list = Array.isArray(data?.data) ? data.data : [];
        setFornecedores(list);
        setFilteredData(list);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar fornecedores:', err);
        setFornecedores([]);
        setFilteredData([]);
        setError('Não foi possível carregar fornecedores. Verifique o backend e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadFornecedores();
  }, []);

  if (loading) {
    return <div>Carregando fornecedores...</div>;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {/* Barra de busca */}
      <SearchBar model={novoFornecedor} dados={fornecedores} setDados={setFilteredData} campos={campos} setCampos={setCampos} />

      {/* Tabela de resultados */}
      <Table data={filteredData} columns={columns} />
    </>
  );
};

export default Page;
