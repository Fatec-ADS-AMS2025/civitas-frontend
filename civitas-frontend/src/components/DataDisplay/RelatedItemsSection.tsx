"use client";

import { RelationshipCard } from "./RelationshipCard";
import { relatedGridClasses } from "./shared";
import type { RelatedItemsSectionProps } from "./types";

export function RelatedItemsSection({
  title,
  description,
  items,
  emptyMessage = "Nenhum item relacionado encontrado.",
  columns = 2,
  className = "",
}: RelatedItemsSectionProps) {
  return (
    <section
      className={`rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 md:p-5 ${className}`.trim()}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        {description ? <p className="mt-1 text-sm text-[var(--foreground-soft)]">{description}</p> : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[var(--divider)] px-4 py-5 text-sm text-[var(--foreground-soft)]">
          {emptyMessage}
        </div>
      ) : (
        <div className={`grid gap-3 ${relatedGridClasses[columns]}`}>
          {items.map((item, index) => (
            <RelationshipCard key={`${String(item.title)}-${index}`} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
