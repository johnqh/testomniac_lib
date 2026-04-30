import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  PageResponse,
  PersonaResponse,
  ScanDetailResponse,
  TestCaseResponse,
  TestRunResponse,
} from '@sudobility/testomniac_types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { TestomniacClient } from '@sudobility/testomniac_client';

interface UseRunManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  runId: number;
  token: FirebaseIdToken;
  enabled?: boolean;
}

export function useRunManager(config: UseRunManagerConfig) {
  const { networkClient, baseUrl, runId, token, enabled = true } = config;

  const [run, setRun] = useState<ScanDetailResponse | null>(null);
  const [pages, setPages] = useState<PageResponse[]>([]);
  const [testCases, setTestCases] = useState<TestCaseResponse[]>([]);
  const [testRuns, setTestRuns] = useState<TestRunResponse[]>([]);
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);
  const [components, setComponents] = useState<unknown[]>([]);
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
      const [
        runRes,
        pagesRes,
        testCasesRes,
        testRunsRes,
        personasRes,
        componentsRes,
      ] = await Promise.all([
        client.getRun(runId, token),
        client.getRunPages(runId, token),
        client.getRunTestCases(runId, token),
        client.getRunTestRuns(runId, token),
        client.getRunPersonas(runId, token),
        client.getRunComponents(runId, token),
      ]);

      if (runRes.success && runRes.data) setRun(runRes.data);
      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (testCasesRes.success && testCasesRes.data)
        setTestCases(testCasesRes.data);
      if (testRunsRes.success && testRunsRes.data)
        setTestRuns(testRunsRes.data);
      if (personasRes.success && personasRes.data)
        setPersonas(personasRes.data);
      if (componentsRes.success && componentsRes.data)
        setComponents(componentsRes.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch run data')
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, runId, token]);

  useEffect(() => {
    if (enabled) {
      void fetchAll();
    }
  }, [enabled, fetchAll]);

  return {
    run,
    pages,
    testCases,
    testRuns,
    personas,
    components,
    isLoading,
    error,
    counts: {
      pages: pages.length,
      testCases: testCases.length,
      testRuns: testRuns.length,
      personas: personas.length,
      components: components.length,
    },
  };
}
