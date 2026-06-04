import type { ReactNode } from "react";

export type ListingSortType = "text" | "number" | "date";
export type ListingFilterType = "text" | "select" | "number-range" | "date-range";
export type ListingPaginationMode = "client" | "server";
export type ListingViewMode = "single" | "compare";
export type ListingPanelId = "primary" | "secondary";
export type ListingRow = Record<string, unknown>;

export type ListingOption = {
  label: string;
  value: string;
};

export type ListingFilterDefinition = {
  id: string;
  label: string;
  type: ListingFilterType;
  options?: ListingOption[];
};

export type ListingPreset = {
  id: string;
  label: string;
  description?: string;
  filterValues?: Record<string, string>;
};

export type ListingColumn<T extends ListingRow> = {
  id: string;
  label: string;
  accessor: (row: T) => unknown;
  sortType?: ListingSortType;
  defaultVisible?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
};

export type ListingLoadParams = {
  page: number;
  pageSize: number;
  search?: string;
  filterValues?: Record<string, string>;
  sortColumnId?: string;
  sortDirection?: "asc" | "desc";
};

export type ListingPageResult<T extends ListingRow> = {
  rows: T[];
  allRows?: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type ListingConfig<T extends ListingRow> = {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  emptyTitle: string;
  emptyDescription: string;
  paginationMode?: ListingPaginationMode;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  presets: ListingPreset[];
  columns: ListingColumn<T>[];
  filters: ListingFilterDefinition[];
  loadPage: (params: ListingLoadParams) => Promise<ListingPageResult<T>>;
  loadExportRows?: (params: ListingLoadParams) => Promise<T[]>;
  getRowId: (row: T) => string;
};

export type ListingRegistry = Record<string, ListingConfig<Record<string, unknown>>>;

export type ListingViewState = {
  selectedPresetId?: string;
  search: string;
  filterValues: Record<string, string>;
  visibleColumnIds: string[];
  sortColumnId?: string;
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type ListingPanelSelection = Record<ListingPanelId, string>;
