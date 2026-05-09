"use client";

import { useEffect, useState } from "react";

import { normalizeFornecedorPayload } from "@/global/formPayload";
import { fornecedorService } from "@/hooks/fornecedor";

import type { FieldConfig } from "@/components/Table/searchbar";
import type { ListQuery, PaginatedResult } from "@/hooks/generic";

import {
  camposConst,
  DEFAULT_PAGE_QUERY,
} from "./constants";

import {
  mapFornecedorRows,
  shouldLoadPreviousPage,
} from "./mapper";

type PaginationState = Pick<
  PaginatedResult<any>,
  "currentPage" | "pageSize" | "totalPages" | "totalRecords"
>;

const emptyPaginationState: PaginationState = {
  currentPage: DEFAULT_PAGE_QUERY.page,
  pageSize: DEFAULT_PAGE_QUERY.size,
  totalPages: 0,
  totalRecords: 0,
};

export const useFornecedorPage = () => {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paginationState, setPaginationState] =
    useState<PaginationState>(emptyPaginationState);

  const [currentPage, setCurrentPage] =
    useState(DEFAULT_PAGE_QUERY.page);

  const [pageSize, setPageSize] =
    useState(DEFAULT_PAGE_QUERY.size);

  const applyFornecedorPage = (pageResult: any) => {
    setFornecedores(pageResult.items);
    setFilteredData(pageResult.items);

    setPaginationState({
      currentPage: pageResult.currentPage,
      pageSize: pageResult.pageSize,
      totalPages: pageResult.totalPages,
      totalRecords: pageResult.totalRecords,
    });

    setCurrentPage(pageResult.currentPage);
    setPageSize(pageResult.pageSize);
  };

  const loadFornecedorPage = async (
    query: ListQuery = {
      page: currentPage,
      size: pageSize,
    }
  ) => {
    try {
      setLoading(true);

   const page = await fornecedorService.getPage(query);

const initialPage = {
  ...page,
  items: mapFornecedorRows(page.items),
};

      const resolvedPage = shouldLoadPreviousPage(
        initialPage
      )
        ? {
            ...(await fornecedorService.getPage({
              ...query,
              page: initialPage.totalPages,
              size: initialPage.pageSize,
            })),
            items: mapFornecedorRows(
              (
                await fornecedorService.getPage({
                  ...query,
                  page: initialPage.totalPages,
                  size: initialPage.pageSize,
                })
              ).items
            ),
          }
        : initialPage;

      applyFornecedorPage(resolvedPage);

      setError(null);

      return resolvedPage;
    } catch (err) {
      console.error(
        "Erro ao carregar fornecedores:",
        err
      );

      setFornecedores([]);
      setFilteredData([]);

      setPaginationState(
        emptyPaginationState
      );

      setError(
        "Nao foi possivel carregar os fornecedores. Verifique o backend e tente novamente."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFornecedorPage(
      DEFAULT_PAGE_QUERY
    );
  }, []);

  const handleCreate = async (
    data: any
  ) => {
    await fornecedorService.create(
      normalizeFornecedorPayload(data)
    );

    await loadFornecedorPage({
      page: currentPage,
      size: pageSize,
    });
  };

  const handleUpdate = async (
    id: number,
    data: any
  ) => {
    await fornecedorService.update(
      id,
      normalizeFornecedorPayload(data)
    );

    await loadFornecedorPage({
      page: currentPage,
      size: pageSize,
    });
  };

  const handleDelete = async (
    id: number
  ) => {
    await fornecedorService.alterarSituacao(
      id
    );

    await loadFornecedorPage({
      page: currentPage,
      size: pageSize,
    });
  };

  const handlePageChange = (
    nextPage: number
  ) => {
    if (
      nextPage < 1 ||
      nextPage === currentPage
    ) {
      return;
    }

    void loadFornecedorPage({
      page: nextPage,
      size: pageSize,
    });
  };

  const handlePageSizeChange = (
    nextSize: number
  ) => {
    if (
      nextSize < 1 ||
      nextSize === pageSize
    ) {
      return;
    }

    void loadFornecedorPage({
      page: DEFAULT_PAGE_QUERY.page,
      size: nextSize,
    });
  };

  return {
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
  };
};