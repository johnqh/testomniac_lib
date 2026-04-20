import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { ProjectSummaryResponse } from '@sudobility/testomniac_types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { TestomniacClient } from '@sudobility/testomniac_client';

interface UseDashboardManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  entitySlug: string;
  token: FirebaseIdToken;
  enabled?: boolean;
}

export function useDashboardManager(config: UseDashboardManagerConfig) {
  const { networkClient, baseUrl, entitySlug, token, enabled = true } = config;

  const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => new TestomniacClient({ networkClient, baseUrl }),
    [networkClient, baseUrl]
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.getEntityProjects(entitySlug, token);
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch projects')
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, entitySlug, token]);

  useEffect(() => {
    if (enabled) {
      void fetchProjects();
    }
  }, [enabled, fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetchProjects: fetchProjects,
  };
}
