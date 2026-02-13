import { useCallback, useRef, useState } from "react";

function createToastId() {
  return `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function useAppToasts() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const pushToast = useCallback((payload) => {
    const id = createToastId();
    const toast = {
      id,
      type: payload?.type || "info",
      title: payload?.title || "",
      description: payload?.description || ""
    };

    setToasts((prev) => [toast, ...prev].slice(0, 4));

    const duration = payload?.duration ?? 2600;
    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return { toasts, pushToast, removeToast };
}
