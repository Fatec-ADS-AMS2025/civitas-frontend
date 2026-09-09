"use client";

import { InfoList } from "./InfoList";
import { InfoValue, toneClasses } from "./shared";
import type { InfoCardProps } from "./types";

export function InfoCard({
  eyebrow,
  title,
  subtitle,
  badge,
  icon,
  tone = "default",
  primaryItems = [],
  secondaryItems = [],
  relationshipItems = [],
  footerItems = [],
  actions,
  children,
  className = "",
}: InfoCardProps) {
  const iconTone = tone === "default" ? "teal" : tone;

  return (
    <article
      className={`civitas-enter flex h-full min-w-0 flex-col rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-xs)] transition hover:border-[var(--border-default)] hover:bg-[var(--surface-subtle)] sm:p-5 ${className}`.trim()}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border ${toneClasses[iconTone]}`}
          >
            <span className="material-symbols-outlined !text-[22px]">{icon}</span>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="break-words text-base font-semibold leading-6 text-[var(--foreground)]">
                <InfoValue value={title} />
              </h3>
              {subtitle ? (
                <p className="mt-1 break-words text-sm leading-5 text-[var(--foreground-muted)]">{subtitle}</p>
              ) : null}
            </div>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
        </div>
      </div>

      {primaryItems.length > 0 ? <InfoList items={primaryItems} className="mt-4" /> : null}
      {relationshipItems.length > 0 ? (
        <div className="mt-4 border-t border-[var(--divider)] pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
            Relacionamentos
          </p>
          <InfoList items={relationshipItems} compact />
        </div>
      ) : null}
      {secondaryItems.length > 0 ? <InfoList items={secondaryItems} compact className="mt-4" /> : null}
      {children ? <div className="mt-4">{children}</div> : null}
      {(footerItems.length > 0 || actions) && (
        <div className="mt-auto flex flex-col gap-4 border-t border-[var(--divider)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          {footerItems.length > 0 ? <InfoList items={footerItems} compact className="flex-1" /> : <span />}
          {actions ? <div className="flex shrink-0 items-center justify-end gap-2">{actions}</div> : null}
        </div>
      )}
    </article>
  );
}
