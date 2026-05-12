import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  PageResponse,
  TestInteractionResponse,
  TestSurfaceResponse,
} from '@sudobility/testomniac_types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { TestomniacClient } from '@sudobility/testomniac_client';

interface UseEnvironmentManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  envId: number;
  token: FirebaseIdToken;
  enabled?: boolean;
}

export function useEnvironmentManager(config: UseEnvironmentManagerConfig) {
  const { networkClient, baseUrl, envId, token, enabled = true } = config;

  const [pages, setPages] = useState<PageResponse[]>([]);
  const [testInteractions, setTestInteractions] = useState<
    TestInteractionResponse[]
  >([]);
  const [testSurfaces, setTestSurfaces] = useState<TestSurfaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => new TestomniacClient({ networkClient, baseUrl }),
    [networkClient, baseUrl]
  );

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pagesRes, testInteractionsRes, testSurfacesRes] =
        await Promise.all([
          client.getEnvironmentPages(envId, token),
          client.getEnvironmentTestInteractions(envId, token),
          client.getEnvironmentTestSurfaces(envId, token),
        ]);

      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (testInteractionsRes.success && testInteractionsRes.data)
        setTestInteractions(testInteractionsRes.data);
      if (testSurfacesRes.success && testSurfacesRes.data)
        setTestSurfaces(testSurfacesRes.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch environment data')
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, envId, token]);

  useEffect(() => {
    if (enabled) {
      void fetchAll();
    }
  }, [enabled, fetchAll]);

  return {
    pages,
    testInteractions,
    testSurfaces,
    isLoading,
    error,
    counts: {
      pages: pages.length,
      testInteractions: testInteractions.length,
      testSurfaces: testSurfaces.length,
    },
  };
}
