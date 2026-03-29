"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
};

type ShowToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastStore = {
  toasts: ToastItem[];
  showToast: (input: ShowToastInput) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

const DEFAULT_DURATION = 4200;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: ({ title, message, variant = "info", duration = DEFAULT_DURATION }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, title, message, variant, duration }],
    }));

    if (duration > 0) {
      window.setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  show: (input: ShowToastInput) => useToastStore.getState().showToast(input),
  success: (message: string, title = "Sucesso") =>
    useToastStore.getState().showToast({ message, title, variant: "success" }),
  error: (message: string, title = "Erro") =>
    useToastStore.getState().showToast({ message, title, variant: "error", duration: 5200 }),
  info: (message: string, title = "Aviso") =>
    useToastStore.getState().showToast({ message, title, variant: "info" }),
  warning: (message: string, title = "Atenção") =>
    useToastStore.getState().showToast({ message, title, variant: "warning" }),
};
