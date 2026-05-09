import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";

export type DashboardSummaryRow = {
  label: string;
  value: string;
  helper: string;
  toggleable?: boolean;
};

export type DashboardQuickLink = {
  label: string;
  href: string;
};

export type DueSoonExpense = DespesaDashboardRow & {
  daysUntilDue: number | null;
};
