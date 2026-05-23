"use client";

import { gridClasses, InfoValue, isEmptyNode, toneClasses } from "./shared";
import type { InfoListProps } from "./types";

export function InfoList({
  items,
  columns = 2,
  compact = false,
  className = "",
}: InfoListProps) {
  const visibleItems = items.filter((item) => !isEmptyNode(item.value));

  if (visibleItems.length === 0) return null;

  return (
    <dl className={`grid gap-3 ${gridClasses[columns]} ${className}`.trim()}>
      {visibleItems.map((item, index) => {
        const tone = item.tone ?? "default";

        return (
          <div
            key={`${item.label}-${index}`}
            className={`min-w-0 rounded-sm border px-3 ${
              compact ? "py-2.5" : "py-3"
            } ${toneClasses[tone]}`}
          >
            <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              {item.icon ? (
                <span className="material-symbols-outlined !text-[17px] text-inherit">
                  {item.icon}
                </span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </dt>
            <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">
              <InfoValue value={item.value} />
            </dd>
            {item.helper ? (
              <dd className="mt-1 min-w-0 break-words text-xs text-[var(--foreground-soft)]">
                {item.helper}
              </dd>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}
