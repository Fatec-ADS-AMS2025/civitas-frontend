'use client';

import React, { ReactNode } from 'react';

type ModalProps = {
  value: boolean;
  setValue: (open: boolean) => void;
  children: ReactNode;
};

export default function Modal({ value, setValue, children }: ModalProps) {
  if (!value) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg relative min-w-[300px] text-gray-900">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={() => setValue(false)}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}