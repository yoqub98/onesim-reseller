import { useCallback, useState } from "react";

/**
 * Manages modal open/close state with optional contextual data.
 * @param {any} [initialData=null] - Initial modal data.
 * @returns {{ isOpen: boolean, data: any, open: (nextData?: any) => void, close: () => void }}
 *
 * Usage:
 *   const detailsModal = useModal();
 *   detailsModal.open(order);
 */
export function useModal(initialData = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const open = useCallback((nextData = null) => {
    setData(nextData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setData(initialData);
    setIsOpen(false);
  }, [initialData]);

  return { isOpen, data, open, close };
}

export default useModal;
