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
    <div className="fixed inset-0 flex items-center justify-center bg-black/45 z-[9998] p-4 md:p-8">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg relative min-w-[300px] text-gray-900 w-full max-w-5xl max-h-[95vh] overflow-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={handleClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}