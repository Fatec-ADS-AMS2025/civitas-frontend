"use client";

import React from "react";
import { toast, useToastStore, type ToastVariant } from "@/hooks/toast";

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-red-200 bg-red-50 text-red-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
};

const iconByVariant: Record<ToastVariant, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[10001] flex w-[calc(100%-2rem)] max-w-md flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm ${variantStyles[item.variant]}`}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-[20px]">{iconByVariant[item.variant]}</span>

            <div className="min-w-0 flex-1">
              {item.title && <p className="text-sm font-semibold">{item.title}</p>}
              <p className="text-sm leading-5">{item.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="rounded-full p-1 text-current transition hover:bg-black/5"
              aria-label="Fechar notificação"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { toast };
