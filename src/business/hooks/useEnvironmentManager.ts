import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  PageResponse,
  TestElementResponse,
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
  const [testElements, setTestElements] = useState<TestElementResponse[]>([]);
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
      const [pagesRes, testElementsRes, testSurfacesRes] = await Promise.all([
        client.getEnvironmentPages(envId, token),
        client.getEnvironmentTestElements(envId, token),
        client.getEnvironmentTestSurfaces(envId, token),
      ]);

      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (testElementsRes.success && testElementsRes.data)
        setTestElements(testElementsRes.data);
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
    testElements,
    testSurfaces,
    isLoading,
    error,
    counts: {
      pages: pages.length,
      testElements: testElements.length,
      testSurfaces: testSurfaces.length,
    },
  };
}
