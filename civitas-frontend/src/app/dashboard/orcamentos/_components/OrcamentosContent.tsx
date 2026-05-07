"use client";

import { SearchBar } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";

import {
  columns,
  novoOrcamento,
  buildCampos,
  buildFormFields,
} from "./constants";

import { useOrcamentosPage } from "./useOrcamentosPage";

export default function OrcamentosContent() {
  const {
    orcamentos,
    filteredData,

    setFilteredData,

    instituicaoOptions,
    tipoDespesaOptions,

    loading,
    error,

    handleCreate,
    handleUpdate,
    handleDelete,
  } = useOrcamentosPage();

  const campos = buildCampos(
    instituicaoOptions,
    tipoDespesaOptions
  );

  const formFields = buildFormFields(
    instituicaoOptions,
    tipoDespesaOptions
  );

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
        model={novoOrcamento}
        dados={orcamentos}
        setDados={setFilteredData}
        campos={campos}
        setCampos={() => {}}
        onCadastrar={handleCreate}
        formFields={formFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={formFields}
      />
    </>
  );
}