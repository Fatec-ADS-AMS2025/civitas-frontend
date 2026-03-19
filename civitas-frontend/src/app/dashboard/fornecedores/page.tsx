"use client";

import React, { useEffect, useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { fornecedorService } from "@/hooks/fornecedor";
import { getSituacaoLabel } from "@/global/situacao";
import FornecedorDTO from "@/models/fornecedor";

type Fornecedor = FornecedorDTO;
type FornecedorRow = Fornecedor & { situacaoLabel: string };

const novoFornecedor = {
  idFornecedor: 0,
  nomeFantasia: "",
  situacao: 1,
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
  { id: "situacaoLabel", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  { key: "situacao", placeholder: "Situação", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

export default function Page() {
  const [fornecedores, setFornecedores] = useState<FornecedorRow[]>([]);
  const [filteredData, setFilteredData] = useState<FornecedorRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFornecedores = async () => {
      try {
        setLoading(true);
        const list = await fornecedorService.getAll();
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
        const rows = list.map((fornecedor) => ({
          ...fornecedor,
          situacaoLabel: getSituacaoLabel(fornecedor.situacao),
        }));
        setFornecedores(rows);
        setFilteredData(rows);
=======
        setFornecedores(list);
        setFilteredData(list);
>>>>>>> dev
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err);
        setFornecedores([]);
        setFilteredData([]);
        setError("Não foi possível carregar fornecedores. Verifique o backend e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    void loadFornecedores();
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

      <SearchBar
        model={novoFornecedor}
        dados={fornecedores}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
      />

      <Table data={filteredData} columns={columns} />
    </>
  );
}
