import { exportTableData } from "@/components/Table/export-utils";
import type { TableColumn } from "@/components/Table/export-types";
import type {
  ListingColumn,
  ListingConfig,
  ListingFilterDefinition,
  ListingViewState,
} from "./types";

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=.*\.)/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const parseDate = (value: unknown): number | null => {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const normalized = value.includes("/") ? value.split("/").reverse().join("-") : value;
    const timestamp = new Date(normalized).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
};

const matchesFilter = (
  rowValue: unknown,
  filterDefinition: ListingFilterDefinition,
  filterValue: string,
): boolean => {
  if (!filterValue) {
    return true;
  }

  if (filterDefinition.type === "text" || filterDefinition.type === "select") {
    return normalizeText(rowValue).includes(normalizeText(filterValue));
  }

  if (filterDefinition.type === "number-range") {
    const [rawMin = "", rawMax = ""] = filterValue.split("|");
    const value = parseNumber(rowValue);
    const min = rawMin ? Number(rawMin) : null;
    const max = rawMax ? Number(rawMax) : null;

    if (value === null) return false;
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    return true;
  }

  if (filterDefinition.type === "date-range") {
    const [rawFrom = "", rawTo = ""] = filterValue.split("|");
    const value = parseDate(rowValue);
    const from = rawFrom ? parseDate(rawFrom) : null;
    const to = rawTo ? parseDate(rawTo) : null;

    if (value === null) return false;
    if (from !== null && value < from) return false;
    if (to !== null && value > to) return false;
    return true;
  }

  return true;
};

export const getDefaultVisibleColumnIds = <T extends Record<string, unknown>>(
  columns: ListingColumn<T>[],
) => {
  const explicitVisible = columns.filter((column) => column.defaultVisible !== false);
  return (explicitVisible.length > 0 ? explicitVisible : columns).map((column) => column.id);
};

export const getInitialListingViewState = <T extends Record<string, unknown>>(
  config: ListingConfig<T>,
): ListingViewState => {
  const preset = config.presets[0];

  return {
    selectedPresetId: preset?.id,
    search: "",
    filterValues: { ...(preset?.filterValues ?? {}) },
    visibleColumnIds: getDefaultVisibleColumnIds(config.columns),
    sortColumnId: undefined,
    sortDirection: "asc",
    page: 1,
    pageSize: config.defaultPageSize ?? 10,
  };
};

export const getVisibleColumns = <T extends Record<string, unknown>>(
  columns: ListingColumn<T>[],
  visibleColumnIds: string[],
) => {
  const allowed = new Set(visibleColumnIds);
  return columns.filter((column) => allowed.has(column.id));
};

export const applyListingFilters = <T extends Record<string, unknown>>(
  rows: T[],
  config: ListingConfig<T>,
  viewState: ListingViewState,
) => {
  const normalizedSearch = normalizeText(viewState.search);
  const activeFilters = Object.entries(viewState.filterValues).filter(([, value]) => value);

  return rows.filter((row) => {
    const searchMatch =
      normalizedSearch.length === 0 ||
      config.columns.some((column) =>
        normalizeText(column.accessor(row)).includes(normalizedSearch),
      );

    if (!searchMatch) {
      return false;
    }

    return activeFilters.every(([filterId, filterValue]) => {
      const column = config.columns.find((item) => item.id === filterId);
      const definition = config.filters.find((item) => item.id === filterId);

      if (!column || !definition) {
        return true;
      }

      return matchesFilter(column.accessor(row), definition, filterValue);
    });
  });
};

export const applyListingSort = <T extends Record<string, unknown>>(
  rows: T[],
  columns: ListingColumn<T>[],
  sortColumnId: string | undefined,
  sortDirection: "asc" | "desc",
) => {
  if (!sortColumnId) {
    return rows;
  }

  const column = columns.find((item) => item.id === sortColumnId);
  if (!column) {
    return rows;
  }

  const directionFactor = sortDirection === "asc" ? 1 : -1;
  const sortedRows = [...rows].sort((left, right) => {
    const leftValue = column.accessor(left);
    const rightValue = column.accessor(right);

    if (column.sortType === "number") {
      const leftNumber = parseNumber(leftValue) ?? Number.NEGATIVE_INFINITY;
      const rightNumber = parseNumber(rightValue) ?? Number.NEGATIVE_INFINITY;
      return (leftNumber - rightNumber) * directionFactor;
    }

    if (column.sortType === "date") {
      const leftDate = parseDate(leftValue) ?? Number.NEGATIVE_INFINITY;
      const rightDate = parseDate(rightValue) ?? Number.NEGATIVE_INFINITY;
      return (leftDate - rightDate) * directionFactor;
    }

    return normalizeText(leftValue).localeCompare(normalizeText(rightValue), "pt-BR") * directionFactor;
  });

  return sortedRows;
};

export const buildExportRows = <T extends Record<string, unknown>>(
  rows: T[],
  columns: ListingColumn<T>[],
): Record<string, unknown>[] => {
  return rows.map((row) =>
    columns.reduce<Record<string, unknown>>((accumulator, column) => {
      const rawValue = column.accessor(row);
      accumulator[column.id] = rawValue ?? "-";
      return accumulator;
    }, {}),
  );
};

export const buildExportColumns = <T extends Record<string, unknown>>(
  columns: ListingColumn<T>[],
): TableColumn[] => {
  return columns.map((column) => ({
    id: column.id,
    label: column.label,
  }));
};

export const exportListingRows = async <T extends Record<string, unknown>>({
  config,
  columns,
  rows,
  outputType,
}: {
  config: ListingConfig<T>;
  columns: ListingColumn<T>[];
  rows: T[];
  outputType: "xlsx" | "pdf";
}) => {
  await exportTableData({
    outputType,
    title: config.label,
    fileName: config.id,
    rows: buildExportRows(rows, columns),
    columns: buildExportColumns(columns),
  });
};

export const buildFilterOptionsFromRows = <T extends Record<string, unknown>>(
  rows: T[],
  column: ListingColumn<T>,
) => {
  const values = Array.from(
    new Set(
      rows
        .map((row) => column.accessor(row))
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
        .map((value) => String(value)),
    ),
  ).sort((left, right) => left.localeCompare(right, "pt-BR"));

  return values.map((value) => ({
    value,
    label: value,
  }));
};
