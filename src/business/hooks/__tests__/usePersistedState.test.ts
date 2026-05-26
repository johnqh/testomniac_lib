import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedState } from '../usePersistedState';
import type { StorageAdapter } from '../usePersistedState';

function createMockStorage(
  initial: Record<string, string> = {}
): StorageAdapter {
  const store = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  };
}

describe('usePersistedState', () => {
  it('returns defaultValue before storage loads', () => {
    const storage = createMockStorage();
    const { result } = renderHook(() =>
      usePersistedState('testKey', 'default', storage)
    );
    expect(result.current[0]).toBe('default');
  });

  it('loads persisted value from storage', async () => {
    const storage = createMockStorage({ testKey: JSON.stringify('saved') });
    const { result } = renderHook(() =>
      usePersistedState('testKey', 'default', storage)
    );
    await vi.waitFor(() => {
      expect(result.current[0]).toBe('saved');
    });
  });

  it('persists value on set', async () => {
    const storage = createMockStorage();
    const { result } = renderHook(() =>
      usePersistedState('testKey', 'default', storage)
    );
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    await vi.waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify('updated')
      );
    });
  });

  it('validates loaded value and falls back to default', async () => {
    const storage = createMockStorage({ testKey: JSON.stringify('invalid') });
    const validate = (v: unknown): v is string =>
      typeof v === 'string' && ['a', 'b'].includes(v);
    const { result } = renderHook(() =>
      usePersistedState('testKey', 'a', storage, validate)
    );
    await vi.waitFor(() => {
      expect(storage.getItem).toHaveBeenCalled();
    });
    expect(result.current[0]).toBe('a');
  });
});
