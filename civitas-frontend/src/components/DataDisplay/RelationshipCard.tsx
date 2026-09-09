"use client";

import { InfoList } from "./InfoList";
import { InfoValue } from "./shared";
import type { RelationshipCardProps } from "./types";

export function RelationshipCard({
  title,
  subtitle,
  badge,
  icon = "hub",
  items = [],
  action,
  className = "",
}: RelationshipCardProps) {
  return (
    <article
      className={`rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 ${className}`.trim()}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--tone-teal-border)] bg-[var(--tone-teal-bg)] text-[var(--tone-teal-text)]">
          <span className="material-symbols-outlined !text-[20px]">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="break-words text-sm font-semibold text-[var(--foreground)]">
                <InfoValue value={title} />
              </h4>
              {subtitle ? <p className="mt-1 break-words text-xs text-[var(--foreground-soft)]">{subtitle}</p> : null}
            </div>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
        </div>
      </div>

      {items.length > 0 ? <InfoList items={items} compact className="mt-4" /> : null}
      {action ? <div className="mt-4 flex justify-end">{action}</div> : null}
    </article>
  );
}
