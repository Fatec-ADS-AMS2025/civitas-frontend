import type { TableColumn, TableExportOutputType } from "./export-types";

type ExportableRow = Record<string, unknown>;

type ExportTableDataParams<T extends object> = {
  outputType: TableExportOutputType;
  title: string;
  fileName: string;
  rows: T[];
  columns: TableColumn[];
};

const ACTIVE_STATUS_VALUES = new Set(["ativo", "true", "sim", "1"]);
const INACTIVE_STATUS_VALUES = new Set(["inativo", "false", "nao", "0", "2"]);

export const isStatusColumn = (columnId: string) => {
  const normalized = columnId.toLowerCase();

  return (
    normalized === "status" ||
    normalized === "statuslabel" ||
    normalized === "situacao" ||
    normalized === "situacaolabel"
  );
};

const toRecord = <T extends object>(value: T): ExportableRow => value as ExportableRow;

export const getStatusValue = <T extends object>(row: T) => {
  const record = toRecord(row);
  return record.status ?? record.situacao ?? record.ativo ?? record.estado ?? null;
};

export const getStatusText = (status: unknown): string | null => {
  if (status === null || status === undefined || status === "") {
    return null;
  }

  const normalized = String(status).trim().toLowerCase();

  if (ACTIVE_STATUS_VALUES.has(normalized)) {
    return "Ativo";
  }

  if (INACTIVE_STATUS_VALUES.has(normalized)) {
    return "Inativo";
  }

  return String(status);
};

const formatIdText = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `#${String(value).padStart(3, "0")}`;
};

export const getTableCellText = <T extends object>(row: T, column: TableColumn): string => {
  const record = toRecord(row);

  if (isStatusColumn(column.id)) {
    const statusValue =
      record[column.id] !== undefined && record[column.id] !== null && record[column.id] !== ""
        ? record[column.id]
        : getStatusValue(row);

    return getStatusText(statusValue) ?? "-";
  }

  const value = record[column.id];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (column.id.toLowerCase() === "id") {
    return formatIdText(value);
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Nao";
  }

  return String(value);
};

export const getSelectedColumns = (columns: TableColumn[], selectedColumnIds: string[]): TableColumn[] => {
  const selected = new Set(selectedColumnIds);
  return columns.filter((column) => selected.has(column.id));
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

export const formatExportDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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

const buildSheetRows = <T extends object>(rows: T[], columns: TableColumn[]) => {
  return rows.map((row) => columns.map((column) => getTableCellText(row, column)));
};

const exportToExcel = async <T extends object>({ title, fileName, rows, columns }: ExportTableDataParams<T>) => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31) || "Exportacao");
  const headerLabels = columns.map((column) => column.label);
  const tableRows = buildSheetRows(rows, columns);

  worksheet.addRow(headerLabels);
  tableRows.forEach((row) => {
    worksheet.addRow(row);
  });

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
    if (rowNumber === 1) {
      return;
    }

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
    const maxContentLength = Math.max(column.label.length, ...tableRows.map((row) => String(row[index] ?? "").length));

    return {
      width: Math.min(Math.max(maxContentLength + 4, 14), 36),
    };
  });

  worksheet.autoFilter = {
    from: "A1",
    to: `${worksheet.getRow(1).getCell(columns.length).address}`,
  };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${sanitizeFileName(fileName)}.xlsx`,
  );
};

const exportToPdf = async <T extends object>({ title, fileName, rows, columns }: ExportTableDataParams<T>) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });
  const generatedAt = formatExportDateTime(new Date());

  doc.setFontSize(16);
  doc.setTextColor(31, 42, 50);
  doc.text(title, 40, 42);

  doc.setFontSize(10);
  doc.setTextColor(90, 107, 116);
  doc.text(`Gerado em: ${generatedAt}`, 40, 60);

  autoTable(doc, {
    startY: 76,
    head: [columns.map((column) => column.label)],
    body: buildSheetRows(rows, columns),
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
      fontSize: 9,
      cellPadding: 6,
      lineColor: [228, 238, 240],
      lineWidth: 0.5,
      textColor: [51, 51, 51],
      overflow: "linebreak",
    },
    margin: {
      top: 76,
      right: 40,
      bottom: 40,
      left: 40,
    },
  });

  doc.save(`${sanitizeFileName(fileName)}.pdf`);
};

export const exportTableData = async <T extends object>({
  outputType,
  title,
  fileName,
  rows,
  columns,
}: ExportTableDataParams<T>) => {
  if (outputType === "xlsx") {
    await exportToExcel({ outputType, title, fileName, rows, columns });
    return;
  }

  await exportToPdf({ outputType, title, fileName, rows, columns });
};
