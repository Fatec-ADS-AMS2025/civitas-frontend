'use client';

import React, { ReactNode } from 'react';

type ModalProps = {
  value: boolean;
  setValue: ((open: boolean) => void) | (() => void);
  children: ReactNode;
};

export default function Modal({ value, setValue, children }: ModalProps) {
  if (!value) return null;

  const handleClose = () => {
    if (setValue.length === 0) {
      (setValue as () => void)();
      return;
    }
    (setValue as (open: boolean) => void)(false);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(10,31,36,0.52)] p-4 backdrop-blur-[3px] md:p-8">
      <div className="civitas-enter civitas-surface relative min-w-[300px] w-full max-w-5xl max-h-[95vh] overflow-auto p-5 text-[var(--foreground)] md:p-7">
        <button
          className="civitas-action civitas-action--ghost absolute right-3 top-3 h-11 min-h-[44px] w-11 !rounded-[14px] !px-0 text-xl !shadow-none"
          onClick={handleClose}
          aria-label="Fechar modal"
        >
          <span className="material-symbols-outlined !text-[20px]">close</span>
        </button>
        {children}
      </div>
    </div>
  );
}
