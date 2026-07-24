import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay.
 * Useful for search inputs to avoid dispatching on every keystroke.
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

