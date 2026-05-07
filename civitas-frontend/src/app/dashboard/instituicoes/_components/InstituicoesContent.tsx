"use client";

import { SearchBar } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";

import {
  novaInstituicao,
  columns,
  buildInstituicaoFormFields,
} from "./constants";

import { useInstituicoesPage } from "./useInstituicoesPage";

export default function InstituicoesContent() {
  const {
    instituicoes,
    filteredData,

    campos,
    setCampos,

    setFilteredData,

    secretariaOptions,
    tipoInstituicaoOptions,

    loading,
    error,

    handleCreate,
    handleUpdate,
    handleDelete,
  } =
    useInstituicoesPage();

  const formFields =
    buildInstituicaoFormFields(
      secretariaOptions,
      tipoInstituicaoOptions
    );

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
          novaInstituicao
        }
        dados={
          instituicoes
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
          formFields
        }
        formHiddenFields={[
          "id",
        ]}
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
          formFields
        }
        formHiddenFields={[
          "id",
        ]}
        paginationEnabled={
          false
        }
      />
    </>
  );
}