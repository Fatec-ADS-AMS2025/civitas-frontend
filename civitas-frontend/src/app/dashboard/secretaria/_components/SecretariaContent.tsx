"use client";

import { SearchBar } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";

import {
  novaSecretaria,
  columns,
  secretariaFormFields,
} from "./constants";

import {
  useSecretariaPage,
} from "./useSecretariaPage";

export default function SecretariaContent() {
  const {
    secretarias,
    filteredData,

    campos,
    setCampos,

    setFilteredData,

    loading,
    error,

    handleCreate,
    handleUpdate,
    handleDelete,
  } =
    useSecretariaPage();

  if (loading) {
    return (
      <SkeletonTable
        rows={5}
        cols={4}
      />
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={
          novaSecretaria
        }
        dados={
          secretarias
        }
        setDados={
          setFilteredData
        }
        campos={campos}
        setCampos={
          setCampos
        }
        onCadastrar={
          handleCreate
        }
        formFields={
          secretariaFormFields
        }
      />

      <Table
        data={
          filteredData
        }
        columns={
          columns
        }
        onEdit={
          handleUpdate
        }
        onDelete={
          handleDelete
        }
        formFields={
          secretariaFormFields
        }
      />
    </>
  );
}