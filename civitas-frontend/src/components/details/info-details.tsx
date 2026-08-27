"use client";

import type { ReactNode } from "react";

type DetailCardTone = "default" | "teal" | "amber" | "slate" | "danger";

type DetailCardProps = {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: string;
  tone?: DetailCardTone;
};

type DetailField = {
  label: string;
  value: ReactNode;
};

type DetailFieldGridProps = {
  items: DetailField[];
};

type DetailSectionProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

type DetailListProps<T> = {
  items: T[];
  emptyMessage: string;
  getKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
};

const cardToneClassNames: Record<DetailCardTone, string> = {
  default: "border-[var(--border-soft)] bg-[var(--surface-elevated)]",
  teal: "border-[var(--border-accent-teal)] bg-[var(--surface-accent-teal)]",
  amber: "border-[var(--border-accent-amber)] bg-[var(--surface-accent-amber)]",
  slate: "border-[var(--border-accent-slate)] bg-[var(--surface-accent-slate)]",
  danger: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)]",
};

const toDisplayValue = (value: ReactNode) => {
  if (value === null || value === undefined || value === "") {
    return "Nao informado";
  }

  return value;
};

export function DetailCard({ title, value, description, icon, tone = "default" }: DetailCardProps) {
  return (
    <article
      className={`min-h-[124px] rounded-sm border p-4 text-[var(--foreground)] shadow-[var(--shadow-xs)] ${cardToneClassNames[tone]}`}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">{title}</p>
          {icon ? (
            <span className="material-symbols-outlined !text-[20px] text-[var(--secundary-1)]">{icon}</span>
          ) : null}
        </div>
        <div>
          <div className="break-words text-2xl font-semibold leading-tight text-[var(--foreground)]">
            {toDisplayValue(value)}
          </div>
          {description ? <p className="mt-2 text-sm leading-5 text-[var(--foreground-muted)]">{description}</p> : null}
        </div>
      </div>
    </article>
  );
}

export function DetailCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function DetailFieldGrid({ items }: DetailFieldGridProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-3"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-[var(--foreground)]">
            {toDisplayValue(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-5 text-[var(--foreground-soft)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DetailList<T>({ items, emptyMessage, getKey, renderItem }: DetailListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-6 text-sm text-[var(--foreground-soft)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item, index) => (
        <li
          key={getKey(item, index)}
          className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
        >
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
