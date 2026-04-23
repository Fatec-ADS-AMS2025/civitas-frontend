"use client";

import React from "react";
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
      ? "border-[#F2D4D4] bg-[linear-gradient(180deg,#FFF8F8_0%,#FFF4F4_100%)]"
      : "border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,251,251,0.96)_100%)]";

  return (
    <div
      className={`civitas-state civitas-enter rounded-[24px] border px-5 py-6 shadow-[var(--shadow-sm)] ${toneClasses}`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function LoadingState({
  title = "Carregando dados",
  description = "Aguarde enquanto atualizamos as informacoes desta tela.",
  rows = 5,
  cols = 4,
}: LoadingStateProps) {
  return (
    <StateContainer>
      <div className="mb-5 flex items-start gap-3">
        <div className="civitas-state__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[var(--surface-subtle)] text-[var(--secundary-1)]">
          <span className="material-symbols-outlined !text-[22px]">progress_activity</span>
        </div>
        <div>
          <h3 className="civitas-state__title text-lg font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="civitas-state__description mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>

      <SkeletonTable rows={rows} cols={cols} />
    </StateContainer>
  );
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Ajuste os filtros ou cadastre um novo item para preencher esta area.",
  action,
}: EmptyStateProps) {
  return (
    <StateContainer>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="civitas-state__icon flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[var(--secundary-1)]">
          <span className="material-symbols-outlined !text-[28px]">inventory_2</span>
        </div>
        <h3 className="civitas-state__title mt-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="civitas-state__description mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </StateContainer>
  );
}

export function ErrorState({
  title = "Nao foi possivel carregar os dados",
  description = "Tente novamente em instantes. Se o problema continuar, revise os filtros ou a conexao.",
  actionLabel = "Tentar novamente",
  onRetry,
}: ErrorStateProps) {
  return (
    <StateContainer tone="error">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="civitas-state__icon flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEAEA] text-[#C23D3D]">
          <span className="material-symbols-outlined !text-[28px]">error</span>
        </div>
        <h3 className="civitas-state__title mt-4 text-lg font-semibold text-[#842D2D]">{title}</h3>
        <p className="civitas-state__description mt-2 max-w-xl text-sm leading-6 text-[#9B4C4C]">{description}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="civitas-state__action mt-5 inline-flex items-center justify-center rounded-full border border-[#D68787] bg-[#C23D3D] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#C23D3D]/20"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </StateContainer>
  );
}
