"use client";

import { SearchBar } from "@/components/Table/searchbar";

import Table from "@/components/Table/table";

import {
  SkeletonTable,
} from "@/components/skeleton";

interface Props {

  loading: boolean;

  error: string | null;

  usuarios: any[];

  filteredData: any[];

  campos: any[];

  setFilteredData: any;

  setCampos: any;

  handleCreate: any;

  handleUpdate: any;

  handleDelete: any;

  paginationState: any;

  handlePageChange: any;

  handlePageSizeChange: any;

  novoUsuario: any;

  usuarioFormFields: any;

  columns: any;

  PAGE_SIZE_OPTIONS: any;

}

export function UsuariosContent({
  loading,
  error,

  usuarios,
  filteredData,

  campos,
  setCampos,

  setFilteredData,

  handleCreate,
  handleUpdate,
  handleDelete,

  paginationState,

  handlePageChange,
  handlePageSizeChange,

  novoUsuario,

  usuarioFormFields,

  columns,

  PAGE_SIZE_OPTIONS,

}: Props) {

  if (loading) {

    return (
      <SkeletonTable
        rows={5}
        cols={4}
      />
    );

  }

  if (error) {

    return (
      <div>
        Erro: {error}
      </div>
    );

  }

  return (
    <>

      <SearchBar
        model={novoUsuario}
        dados={usuarios}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={
          usuarioFormFields
        }
      />

      <Table
        data={filteredData}

        columns={columns}

        onEdit={handleUpdate}

        onDelete={handleDelete}

        formFields={
          usuarioFormFields
        }

        paginationEnabled={
          true
        }

        pagination={{

          currentPage:
            paginationState.currentPage,

          totalPages:
            paginationState.totalPages,

          totalRecords:
            paginationState.totalRecords,

          pageSize:
            paginationState.pageSize,

          pageSizeOptions:
            PAGE_SIZE_OPTIONS,

          onPageChange:
            handlePageChange,

          onPageSizeChange:
            handlePageSizeChange,

        }}
      />

    </>
  );
}