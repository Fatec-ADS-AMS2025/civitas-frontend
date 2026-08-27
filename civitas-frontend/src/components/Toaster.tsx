"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToast } from "@/hooks/useToast";

type ToastState = {
  message: string;
  type: "success" | "error" | "info";
} | null;

export default function Toaster() {
  const [toast, setToast] = useState<ToastState>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToast((newToast) => {
      setToast(newToast);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    });

    return () => {
      unsubscribe();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  const bgClass =
    toast.type === "success"
      ? "civitas-toast civitas-toast--success"
      : toast.type === "error"
        ? "civitas-toast civitas-toast--error"
        : "civitas-toast civitas-toast--info";

  return (
    <div className="fixed right-3 top-3 z-[9999] sm:right-5 sm:top-5">
      <div className={`${bgClass} px-4 py-3`}>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
