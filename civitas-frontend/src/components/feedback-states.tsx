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
      ? "border-[#F3D3D3] bg-[#FFF7F7]"
      : "border-[#DDEEEF] bg-[#FBFEFE]";

  return (
    <div
      className={`rounded-[24px] border px-5 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] ${toneClasses}`}
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5F5] text-[#0B6470]">
          <span className="material-symbols-outlined !text-[22px]">progress_activity</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1F2A32]">{title}</h3>
          <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
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
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F9FA] text-[#0B6470]">
          <span className="material-symbols-outlined !text-[28px]">inventory_2</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#1F2A32]">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">{description}</p>
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
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8E8] text-[#C23D3D]">
          <span className="material-symbols-outlined !text-[28px]">error</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#842D2D]">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#9B4C4C]">{description}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-full bg-[#C23D3D] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#C23D3D]/20"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </StateContainer>
  );
}
