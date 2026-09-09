"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { TablePaginationConfig } from "@/components/Table/table";

type UseClientPaginationOptions = {
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

const clampPage = (page: number, totalPages: number) => {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
};

export function useClientPagination<T>(items: T[], options: UseClientPaginationOptions = {}) {
  const { initialPageSize = 5, pageSizeOptions = [5, 10, 20] } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isPending, startTransition] = useTransition();

  const totalRecords = items.length;
  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageSize);

  const resolvedCurrentPage = clampPage(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (resolvedCurrentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, pageSize, resolvedCurrentPage]);

  const goToPage = useCallback(
    (nextPage: number) => {
      startTransition(() => {
        setCurrentPage((previousPage) => {
          const targetPage = clampPage(nextPage, totalPages);
          return targetPage === previousPage ? previousPage : targetPage;
        });
      });
    },
    [totalPages],
  );

  const changePageSize = useCallback((nextSize: number) => {
    startTransition(() => {
      setPageSize((previousSize) => (previousSize === nextSize ? previousSize : nextSize));
      setCurrentPage((previousPage) => (previousPage === 1 ? previousPage : 1));
    });
  }, []);

  const resetPagination = useCallback(() => {
    startTransition(() => {
      setCurrentPage((previousPage) => (previousPage === 1 ? previousPage : 1));
    });
  }, []);

  const pagination = useMemo<TablePaginationConfig>(
    () => ({
      currentPage: resolvedCurrentPage,
      totalPages,
      totalRecords,
      pageSize,
      pageSizeOptions,
      onPageChange: goToPage,
      onPageSizeChange: changePageSize,
    }),
    [changePageSize, goToPage, pageSize, pageSizeOptions, resolvedCurrentPage, totalPages, totalRecords],
  );

  return {
    currentPage: resolvedCurrentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    pagination,
    isPending,
    isPageTransitioning: isPending,
    goToPage,
    changePageSize,
    resetPagination,
  };
}
