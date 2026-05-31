import type React from "react";
import type { FieldConfig as ModalFieldConfig, FormMode, ValidationFn } from "../Form/form";
import type { InfoTone } from "@/components/DataDisplay";
import type { TableColumn, TableExportConfig } from "./export-types";

export type TableRow = object;

export type TableCardValue<T extends TableRow> =
  | React.ReactNode
  | ((row: T) => React.ReactNode);

export type TableCardField<T extends TableRow> = {
  label: string;
  columnId?: string;
  value?: TableCardValue<T>;
  icon?: string;
  helper?: TableCardValue<T>;
  tone?: InfoTone;
};

export type TableCardConfig<T extends TableRow> = {
  eyebrow?: TableCardValue<T>;
  title?: TableCardValue<T>;
  subtitle?: TableCardValue<T>;
  badgeColumnId?: string;
  badge?: TableCardValue<T>;
  icon?: string;
  tone?: InfoTone;
  primaryFields?: TableCardField<T>[];
  secondaryFields?: TableCardField<T>[];
  relationshipFields?: TableCardField<T>[];
  footerFields?: TableCardField<T>[];
  gridClassName?: string;
};

export type TableDisplayMode = "table" | "cards";

export type TablePaginationConfig = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

type BaseTableProps<T extends TableRow> = {
  data: T[];
  columns: TableColumn[];
  actions?: string[];
  onEdit?: (id: number, data: Partial<T> & Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: number) => Promise<void>;
  renderModalExtra?: (row: T, mode: FormMode) => React.ReactNode;
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
  isLoading?: boolean;
  loadingTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  exportConfig?: TableExportConfig<T>;
  displayMode?: TableDisplayMode;
  cardConfig?: TableCardConfig<T>;
};

export type TableProps<T extends TableRow> = BaseTableProps<T> &
  (
    | {
        paginationEnabled: true;
        pagination: TablePaginationConfig;
      }
    | {
        paginationEnabled?: false;
        pagination?: TablePaginationConfig;
      }
  );
