import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Wraps an async action with loading/error state and toast notifications.
 * Reduces boilerplate for CRUD operations across pages.
 *
 * Usage:
 *   const { execute, loading } = useAsyncAction({
 *     onSuccess: () => toast.success('Done'),
 *     onError: (err) => toast.error(err),
 *   });
 *   await execute(() => someApiCall());
 */
export default function useAsyncAction(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (action) => {
      setLoading(true);
      setError(null);
      try {
        const result = await action();
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.message ||
          'Something went wrong';
        setError(message);
        if (options.onError) {
          options.onError(message);
        } else {
          toast.error(message);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { execute, loading, error, reset };
}

