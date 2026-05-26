import { useEffect, useRef } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { useEntities } from '@sudobility/testomniac_client';

interface UseEntityManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  token: FirebaseIdToken;
  enabled?: boolean;
}

/**
 * Orchestrates entity (workspace) fetching with automatic retry when the list
 * comes back empty.  After a fresh database or first login the backend
 * auto-creates the user's personal workspace asynchronously — this hook
 * retries once after a short delay so the UI doesn't get stuck.
 */
export function useEntityManager(config: UseEntityManagerConfig) {
  const { networkClient, baseUrl, token, enabled = true } = config;

  const { entities, isLoading, error, refetch } = useEntities({
    networkClient,
    baseUrl,
    token,
    enabled,
  });

  // Retry once if entities come back empty (workspace may still be creating)
  const retried = useRef(false);
  useEffect(() => {
    if (isLoading || !enabled || retried.current) return undefined;
    if (entities.length === 0 && !error) {
      retried.current = true;
      const timer = setTimeout(() => {
        void refetch();
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [entities.length, isLoading, enabled, error, refetch]);

  // Reset retry flag when token changes (new login session)
  useEffect(() => {
    retried.current = false;
  }, [token]);

  return {
    entities,
    isLoading,
    error,
    refetchEntities: refetch,
  };
}
