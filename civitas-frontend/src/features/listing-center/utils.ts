import type { TableColumn } from "@/components/Table/export-types";
import { exportTableData } from "@/components/Table/export-utils";
import type { ListingColumn, ListingConfig, ListingFilterDefinition, ListingPanelId, ListingViewState } from "./types";

type ListingExportSection<T extends Record<string, unknown>> = {
  title: string;
  config: ListingConfig<T>;
  columns: ListingColumn<T>[];
  rows: T[];
};

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const normalizeKeyPart = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text || text === "undefined" || text === "null") return null;

  return text;
};

export const buildListingScopedKey = (fallback: string, ...parts: unknown[]): string => {
  const normalizedParts = parts.map(normalizeKeyPart);

  if (normalizedParts.length === 0 || normalizedParts.some((part) => !part)) {
    return fallback;
  }

  return normalizedParts.join(":");
};

export const buildListingRowKey = <T extends Record<string, unknown>>({
  panelId,
  listingId,
  row,
  index,
  getRowId,
}: {
  panelId: ListingPanelId;
  listingId: string;
  row: T;
  index: number;
  getRowId: (row: T) => string;
}) => {
  const rowId = normalizeKeyPart(getRowId(row));
  return buildListingScopedKey(`${panelId}:${listingId}:row-${index}`, panelId, listingId, rowId);
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d,.-]/g, "");
    const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
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

const matchesFilter = (rowValue: unknown, filterDefinition: ListingFilterDefinition, filterValue: string): boolean => {
  if (!filterValue) {
    return true;
  }

  if (filterDefinition.type === "text") {
    return normalizeText(rowValue).includes(normalizeText(filterValue));
  }

  if (filterDefinition.type === "select") {
    return normalizeText(rowValue) === normalizeText(filterValue);
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

export const getDefaultVisibleColumnIds = <T extends Record<string, unknown>>(columns: ListingColumn<T>[]) => {
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
      config.columns.some((column) => normalizeText(column.accessor(row)).includes(normalizedSearch));

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

export const buildExportColumns = <T extends Record<string, unknown>>(columns: ListingColumn<T>[]): TableColumn[] => {
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
  title,
  fileName,
}: {
  config: ListingConfig<T>;
  columns: ListingColumn<T>[];
  rows: T[];
  outputType: "xlsx" | "pdf";
  title?: string;
  fileName?: string;
}) => {
  await exportTableData({
    outputType,
    title: title ?? config.label,
    fileName: fileName ?? config.id,
    rows: buildExportRows(rows, columns),
    columns: buildExportColumns(columns),
  });
};

export const loadListingRowsForExport = async <T extends Record<string, unknown>>(
  config: ListingConfig<T>,
  viewState: ListingViewState,
) => {
  const loadParams = {
    page: 1,
    pageSize: Math.max(viewState.pageSize, 500),
    search: viewState.search,
    filterValues: viewState.filterValues,
    sortColumnId: viewState.sortColumnId,
    sortDirection: viewState.sortDirection,
  };
  const fallbackResult = config.loadExportRows ? null : await config.loadPage(loadParams);
  const sourceRows = config.loadExportRows
    ? await config.loadExportRows(loadParams)
    : (fallbackResult?.allRows ?? fallbackResult?.rows ?? []);

  return applyListingSort(
    applyListingFilters(sourceRows, config, viewState),
    config.columns,
    viewState.sortColumnId,
    viewState.sortDirection,
  );
};

const sanitizeFileName = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return normalized || "exportacao";
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

const getExportDateTime = () =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

const toSafeSheetName = (value: string, fallback: string) => {
  const cleaned = value
    .replace(/[\\/*?:[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || fallback).slice(0, 31);
};

const styleWorksheet = (worksheet: import("exceljs").Worksheet, columns: TableColumn[]) => {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF58AFAE" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD5E3E6" } },
      left: { style: "thin", color: { argb: "FFD5E3E6" } },
      bottom: { style: "thin", color: { argb: "FFD5E3E6" } },
      right: { style: "thin", color: { argb: "FFD5E3E6" } },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE4EEF0" } },
        left: { style: "thin", color: { argb: "FFE4EEF0" } },
        bottom: { style: "thin", color: { argb: "FFE4EEF0" } },
        right: { style: "thin", color: { argb: "FFE4EEF0" } },
      };
    });
  });

  worksheet.columns = columns.map((column, index) => {
    const columnValues = worksheet.getColumn(index + 1).values.filter((value) => value !== undefined && value !== null);
    const maxContentLength = Math.max(column.label.length, ...columnValues.map((value) => String(value).length));

    return {
      width: Math.min(Math.max(maxContentLength + 4, 14), 36),
    };
  });

  if (columns.length > 0) {
    worksheet.autoFilter = {
      from: "A1",
      to: `${worksheet.getRow(1).getCell(columns.length).address}`,
    };
  }
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};

export const exportListingComparison = async <T extends Record<string, unknown>>({
  outputType,
  title,
  fileName,
  sections,
}: {
  outputType: "xlsx" | "pdf";
  title: string;
  fileName: string;
  sections: ListingExportSection<T>[];
}) => {
  if (outputType === "xlsx") {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();

    sections.forEach((section, index) => {
      const columns = buildExportColumns(section.columns);
      const rows = buildExportRows(section.rows, section.columns);
      const worksheet = workbook.addWorksheet(toSafeSheetName(section.title, `Painel ${index + 1}`));

      worksheet.addRow(columns.map((column) => column.label));
      rows.forEach((row) => {
        worksheet.addRow(columns.map((column) => String(row[column.id] ?? "-")));
      });
      styleWorksheet(worksheet, columns);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${sanitizeFileName(fileName)}.xlsx`,
    );
    return;
  }

  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const maxColumns = Math.max(...sections.map((section) => section.columns.length));
  const doc = new jsPDF({
    orientation: maxColumns > 5 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 76;

  doc.setFontSize(16);
  doc.setTextColor(31, 42, 50);
  doc.text(title, 40, 42);

  doc.setFontSize(10);
  doc.setTextColor(90, 107, 116);
  doc.text(`Gerado em: ${getExportDateTime()}`, 40, 60);

  sections.forEach((section, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 52;
    }

    const columns = buildExportColumns(section.columns);
    const rows = buildExportRows(section.rows, section.columns);

    doc.setFontSize(12);
    doc.setTextColor(31, 42, 50);
    doc.text(section.title, 40, currentY);

    autoTable(doc, {
      startY: currentY + 14,
      head: [columns.map((column) => column.label)],
      body: rows.map((row) => columns.map((column) => String(row[column.id] ?? "-"))),
      theme: "grid",
      headStyles: {
        fillColor: [88, 175, 174],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [247, 250, 251],
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        lineColor: [228, 238, 240],
        lineWidth: 0.5,
        textColor: [51, 51, 51],
        overflow: "linebreak",
      },
      margin: {
        top: 52,
        right: 40,
        bottom: 40,
        left: 40,
      },
      tableWidth: pageWidth - 80,
    });
  });

  doc.save(`${sanitizeFileName(fileName)}.pdf`);
};

export const buildFilterOptionsFromRows = <T extends Record<string, unknown>>(rows: T[], column: ListingColumn<T>) => {
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
