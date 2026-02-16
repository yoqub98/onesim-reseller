import { useCallback, useState } from "react";

/**
 * Handles object-based form fields with simple set/reset helpers.
 * @param {Record<string, any>} initialFields - Initial form field values.
 * @returns {{ fields: Record<string, any>, setField: (key: string, value: any) => void, resetFields: () => void, setFields: (nextFields: Record<string, any>) => void }}
 *
 * Usage:
 *   const { fields, setField, resetFields } = useFormFields({ name: "", email: "" });
 */
export function useFormFields(initialFields) {
  const [fields, setFields] = useState(initialFields);

  const setField = useCallback((key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFields = useCallback(() => {
    setFields(initialFields);
  }, [initialFields]);

  const replaceFields = useCallback((nextFields) => {
    setFields(nextFields);
  }, []);

  return { fields, setField, resetFields, setFields: replaceFields };
}

export default useFormFields;
