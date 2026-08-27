"use client";

import type React from "react";
import { SkeletonTable } from "@/components/skeleton";

type StateContainerProps = {
  children: React.ReactNode;
  tone?: "neutral" | "error";
};

type LoadingStateProps = {
  title?: string;
  description?: string;
  rows?: number;
  cols?: number;
};

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

type ErrorStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

function StateContainer({ children, tone = "neutral" }: StateContainerProps) {
  const toneClasses =
    tone === "error"
      ? "border-[var(--tone-danger-border)] bg-[var(--surface-danger-soft)]"
      : "border-[var(--border-soft)] bg-[var(--surface-elevated)]";

  return (
    <div
      className={`civitas-state civitas-enter rounded-sm border px-5 py-6 ${toneClasses}`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function LoadingState({
  title = "Carregando dados",
  description = "Aguarde enquanto os dados sao carregados.",
  rows = 5,
  cols = 4,
}: LoadingStateProps) {
  return (
    <StateContainer>
      <div className="mb-5 flex items-start gap-3">
        <div className="civitas-state__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[var(--surface-subtle)] text-[var(--secundary-1)]">
          <span className="material-symbols-outlined !text-[22px]">progress_activity</span>
        </div>
        <div>
          <h3 className="civitas-state__title text-base font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="civitas-state__description mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>

      <SkeletonTable rows={rows} cols={cols} />
    </StateContainer>
  );
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Ajuste os filtros ou cadastre um item para continuar.",
  action,
}: EmptyStateProps) {
  return (
    <StateContainer>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="civitas-state__icon flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--surface-subtle)] text-[var(--secundary-1)]">
          <span className="material-symbols-outlined !text-[28px]">inventory_2</span>
        </div>
        <h3 className="civitas-state__title mt-4 text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="civitas-state__description mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </StateContainer>
  );
}

export function ErrorState({
  title = "Nao foi possivel carregar os dados",
  description = "Tente novamente. Se o problema continuar, revise a conexao ou os filtros.",
  actionLabel = "Tentar novamente",
  onRetry,
}: ErrorStateProps) {
  return (
    <StateContainer tone="error">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="civitas-state__icon flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)]">
          <span className="material-symbols-outlined !text-[28px]">error</span>
        </div>
        <h3 className="civitas-state__title mt-4 text-base font-semibold text-[var(--tone-danger-text)]">{title}</h3>
        <p className="civitas-state__description mt-2 max-w-xl text-sm leading-6 text-[var(--tone-danger-text)]">
          {description}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="civitas-state__action civitas-action civitas-action--danger mt-5 px-4 py-2.5 text-sm"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </StateContainer>
  );
}
