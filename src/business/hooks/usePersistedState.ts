import { useCallback, useEffect, useState } from 'react';

/**
 * Platform-agnostic storage adapter.
 * - Browser: wrap localStorage
 * - Chrome extension: wrap chrome.storage.local
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/**
 * Like useState, but the value is loaded from and persisted to a StorageAdapter.
 * Accepts an optional validate function to guard against stale/invalid stored values.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  storage: StorageAdapter,
  validate?: (value: unknown) => value is T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // Load from storage on mount
  useEffect(() => {
    let cancelled = false;
    storage.getItem(key).then(raw => {
      if (cancelled || raw == null) return;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (validate ? validate(parsed) : true) {
          setValue(parsed as T);
        }
      } catch {
        // Corrupted storage value — keep default
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key, storage, validate]);

  // Persist on change
  const set = useCallback(
    (next: T) => {
      setValue(next);
      storage.setItem(key, JSON.stringify(next)).catch(() => {});
    },
    [key, storage]
  );

  return [value, set];
}
