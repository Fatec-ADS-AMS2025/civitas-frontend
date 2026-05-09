"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usuarioService,
} from "@/hooks/usuario";

import type {
  ListQuery,
  PaginatedResult,
} from "@/hooks/generic";

import {
  columns,
  camposConst,

  novoUsuario,

  PAGE_SIZE_OPTIONS,

  DEFAULT_PAGE_QUERY,

  usuarioFormFields,

} from "./constants";

import {
  mapUsuarioToRow,

  toApiUsuarioPayload,

} from "./mapper";

type PaginationState = {

  currentPage: number;

  pageSize: number;

  totalPages: number;

  totalRecords: number;

};

const emptyPaginationState =
{

  currentPage: 1,

  pageSize: 10,

  totalPages: 0,

  totalRecords: 0,

};

export function
useUsuariosPage() {

  const [usuarios,
    setUsuarios] =
    useState<any[]>([]);

  const [
    filteredData,

    setFilteredData,
  ] = useState<any[]>([]);

  const [campos,
    setCampos] =
    useState(
      camposConst,
    );

  const [loading,
    setLoading] =
    useState(true);

  const [error,
    setError] =
    useState<
      string | null
    >(null);

  const [
    paginationState,

    setPaginationState,

  ] = useState<
    PaginationState
  >(
    emptyPaginationState,
  );

  const [
    currentPage,

    setCurrentPage,

  ] = useState(1);

  const [
    pageSize,

    setPageSize,

  ] = useState(10);

  async function
  loadUsuarios(

    query:
      ListQuery = {

      page:
        currentPage,

      size:
        pageSize,

    },

  ) {

    try {

      setLoading(
        true,
      );

      const result =
        await usuarioService
          .getPage(
            query,
          );

      const rows =
        result.items.map(
          mapUsuarioToRow,
        );

      setUsuarios(
        rows,
      );

      setFilteredData(
        rows,
      );

      setPaginationState({

        currentPage:
          result.currentPage,

        pageSize:
          result.pageSize,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

      });

      setError(
        null,
      );

    } catch {

      setError(
        "Erro ao carregar usuarios",
      );

    } finally {

      setLoading(
        false,
      );

    }
  }

  useEffect(() => {

    void loadUsuarios(
      DEFAULT_PAGE_QUERY,
    );

  }, []);

  async function
  handleCreate(
    data: any,
  ) {

    await usuarioService
      .create(
        toApiUsuarioPayload(
          data,
        ),
      );

    await loadUsuarios();

  }

  async function
  handleUpdate(
    id: number,

    data: any,
  ) {

    await usuarioService
      .update(
        id,

        toApiUsuarioPayload(
          data,
        ),
      );

    await loadUsuarios();

  }

  async function
  handleDelete(
    id: number,
  ) {

    await usuarioService
      .alterarSituacao(
        id,
      );

    await loadUsuarios();

  }

  function
  handlePageChange(
    page: number,
  ) {

    void loadUsuarios({

      page,

      size:
        pageSize,

    });

  }

  function
  handlePageSizeChange(
    size: number,
  ) {

    void loadUsuarios({

      page: 1,

      size,

    });

  }

  return {

    loading,
    error,

    usuarios,

    filteredData,

    campos,

    setCampos,

    setFilteredData,

    paginationState,

    handleCreate,

    handleUpdate,

    handleDelete,

    handlePageChange,

    handlePageSizeChange,

    novoUsuario,

    usuarioFormFields,

    columns,

    PAGE_SIZE_OPTIONS,

  };
}