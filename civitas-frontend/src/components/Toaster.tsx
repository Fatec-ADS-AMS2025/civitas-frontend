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
      ? "bg-green-600"
      : toast.type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div
        className={`${bgClass} text-white px-4 py-3 rounded-sm shadow-lg min-w-[260px] max-w-[420px]`}
      >
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
}