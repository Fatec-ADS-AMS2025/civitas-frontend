import type React from "react";
import type { InfoListProps, InfoTone, RelatedItemsSectionProps } from "./types";

export const toneClasses: Record<InfoTone, string> = {
  default: "border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--foreground)]",
  teal: "border-[var(--tone-teal-border)] bg-[var(--tone-teal-bg)] text-[var(--tone-teal-text)]",
  amber: "border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)] text-[var(--tone-amber-text)]",
  slate: "border-[var(--tone-slate-border)] bg-[var(--tone-slate-bg)] text-[var(--tone-slate-text)]",
  coral: "border-[var(--border-accent-coral)] bg-[var(--surface-accent-coral)] text-[var(--text-accent-coral)]",
  success: "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
  danger: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)]",
};

export const gridClasses: Record<NonNullable<InfoListProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export const relatedGridClasses: Record<NonNullable<RelatedItemsSectionProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export const isEmptyNode = (value: React.ReactNode) => value === null || value === undefined || value === "";

export function InfoValue({ value }: { value: React.ReactNode }) {
  if (isEmptyNode(value)) {
    return <span className="text-[var(--foreground-soft)]">-</span>;
  }

  return <>{value}</>;
}
