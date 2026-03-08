'use client';

import React, { ReactNode, useEffect, useRef, useCallback, useId } from 'react';

type ModalProps = {
  value: boolean;
  setValue: (open: boolean) => void;
  children: ReactNode;
  ariaLabel?: string;
};

export default function Modal({ value, setValue, children, ariaLabel }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Gerenciamento de foco: captura o elemento focado antes de abrir e restaura ao fechar
  useEffect(() => {
    if (value) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Foca no diálogo ao abrir
      requestAnimationFrame(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          dialogRef.current?.focus();
        }
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [value]);

  // Fecha com Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setValue(false);
      return;
    }

    // Trap de foco: Tab e Shift+Tab ficam dentro do modal
    if (e.key === 'Tab' && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [setValue]);

  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [value]);

  if (!value) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-[9998] p-4 sm:p-8 md:p-16 lg:p-[300px]"
      onClick={(e) => { if (e.target === e.currentTarget) setValue(false); }}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || 'Modal'}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-white p-6 rounded-xl shadow-lg relative min-w-[300px] text-gray-900 max-w-screen max-h-screen h-fit w-fit overflow-auto focus:outline-none"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl focus-visible:ring-2 focus-visible:ring-primary-1 rounded-full p-1"
          onClick={() => setValue(false)}
          aria-label="Fechar modal"
          type="button"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}