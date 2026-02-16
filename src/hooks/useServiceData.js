import { useCallback, useEffect, useState } from "react";

/**
 * Loads data from a service function on mount and when params change.
 * @param {(params?: any) => Promise<any>} serviceFn - Async service function returning data.
 * @param {any} [params] - Optional params passed to serviceFn.
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: () => void }}
 *
 * Usage:
 *   const { data: plans, loading } = useServiceData(catalogService.getPlans);
 */
export function useServiceData(serviceFn, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const refetch = useCallback(() => {
    setReloadTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = params === undefined ? await serviceFn() : await serviceFn(params);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [serviceFn, params, reloadTick]);

  return { data, loading, error, refetch };
}

export default useServiceData;
