"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { TablePaginationConfig } from "@/components/Table/table";

type UseClientPaginationOptions = {
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

const clampPage = (page: number, totalPages: number) => {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
};

export function useClientPagination<T>(
  items: T[],
  options: UseClientPaginationOptions = {}
) {
  const { initialPageSize = 5, pageSizeOptions = [5, 10, 20] } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isPending, startTransition] = useTransition();

  const totalRecords = items.length;
  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageSize);

  useEffect(() => {
    setCurrentPage((previousPage) => {
      const nextPage = clampPage(previousPage, totalPages);
      return nextPage === previousPage ? previousPage : nextPage;
    });
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  const goToPage = useCallback((nextPage: number) => {
    startTransition(() => {
      setCurrentPage((previousPage) => {
        const targetPage = clampPage(nextPage, totalPages);
        return targetPage === previousPage ? previousPage : targetPage;
      });
    });
  }, [totalPages]);

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
      currentPage,
      totalPages,
      totalRecords,
      pageSize,
      pageSizeOptions,
      onPageChange: goToPage,
      onPageSizeChange: changePageSize,
    }),
    [changePageSize, currentPage, goToPage, pageSize, pageSizeOptions, totalPages, totalRecords]
  );

  return {
    currentPage,
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
