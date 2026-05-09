"use client";

import { SearchBar } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";

import {
  columns,
  camposConst,
  fornecedorFormFields,
  novoFornecedor,
  PAGE_SIZE_OPTIONS,
} from "./constants";

import { useFornecedorPage } from "./useFornecedorPage";

export default function FornecedorContent() {
  const {
    fornecedores,
    filteredData,
    campos,
    setCampos,
    loading,
    error,
    paginationState,
    handleCreate,
    handleUpdate,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    setFilteredData,
  } = useFornecedorPage();

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
        model={novoFornecedor}
        dados={fornecedores}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={fornecedorFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={fornecedorFormFields}
        paginationEnabled={true}
        pagination={{
          ...paginationState,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </>
  );
}