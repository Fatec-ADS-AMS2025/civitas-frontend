"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  value: boolean;
  setValue: ((open: boolean) => void) | (() => void);
  children: ReactNode;
};

export default function Modal({ value, setValue, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevDocumentOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevDocumentOverflow;
    };
  }, []);

  if (!value || !mounted) return null;

  const handleClose = () => {
    if (setValue.length === 0) {
      (setValue as () => void)();
      return;
    }
    (setValue as (open: boolean) => void)(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] bg-[rgba(10,31,36,0.52)] backdrop-blur-[3px]">
      <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <div className="civitas-enter civitas-surface relative flex min-w-0 w-full max-w-5xl flex-col overflow-hidden rounded-sm p-3 text-[var(--foreground)] shadow-[var(--shadow-lg)] max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] sm:p-5 md:p-7">
          <button
            type="button"
            className="civitas-action civitas-action--ghost absolute right-3 top-3 h-11 min-h-[44px] w-11 !rounded-sm !px-0 text-xl !shadow-none z-[9999]"
            onClick={handleClose}
            aria-label="Fechar modal"
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto pt-10 sm:pt-8">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
