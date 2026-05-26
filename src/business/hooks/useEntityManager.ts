import { useEffect, useRef } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { QUERY_KEYS, useEntities } from '@sudobility/testomniac_client';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  const { entities, isLoading, error, refetch } = useEntities({
    networkClient,
    baseUrl,
    token,
    enabled,
  });

  // Retry once if entities come back empty (workspace may still be creating)
  const retried = useRef(false);

  // Invalidate cached entities when token changes (different user session)
  // so we never serve stale data from a previous login.
  const prevToken = useRef(token);
  useEffect(() => {
    if (token !== prevToken.current) {
      prevToken.current = token;
      retried.current = false;
      queryClient.removeQueries({ queryKey: QUERY_KEYS.entities() });
    }
  }, [token, queryClient]);
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

  return {
    entities,
    isLoading,
    error,
    refetchEntities: refetch,
  };
}
