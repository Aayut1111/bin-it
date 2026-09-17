import { useState, useEffect } from "react";

// A useState that reads its initial value from localStorage and writes
// back on every change. `key` is the localStorage key; `initialValue`
// is used the first time the app ever runs (or if storage is unavailable).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable (e.g. private browsing) — fail silently,
      // the app still works for this session, it just won't persist.
    }
  }, [key, value]);

  return [value, setValue];
}