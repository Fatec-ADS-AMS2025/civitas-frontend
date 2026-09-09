type ToastType = "success" | "error" | "info";

type Toast = {
  message: string;
  type: ToastType;
};

let listeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = "info") {
  listeners.forEach((listener) => {
    listener({ message, type });
  });
}

export function subscribeToast(listener: (toast: Toast) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
