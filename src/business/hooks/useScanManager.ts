import { useCallback, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { CreateScanRequest } from '@sudobility/testomniac_types';
import { TestomniacClient } from '@sudobility/testomniac_client';
import { useScanProgressStore } from '../stores/scanProgressStore';

interface UseScanManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
}

export function useScanManager(config: UseScanManagerConfig) {
  const { networkClient, baseUrl } = config;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const store = useScanProgressStore();

  const client = useMemo(
    () => new TestomniacClient({ networkClient, baseUrl }),
    [networkClient, baseUrl]
  );

  const startScan = useCallback(
    async (data: CreateScanRequest) => {
      store.reset();
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const response = await client.submitScan(data);
        if (response.success && response.data?.runId) {
          store.setRunId(response.data.runId);
        }
        return response;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to submit scan');
        setSubmitError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [client, store]
  );

  return {
    startScan,
    isSubmitting,
    submitError,
    runId: store.runId,
    phase: store.phase,
    pagesFound: store.pagesFound,
    pageStatesFound: store.pageStatesFound,
    actionsCompleted: store.actionsCompleted,
    actionsRemaining: store.actionsRemaining,
    issuesFound: store.issuesFound,
    latestScreenshotUrl: store.latestScreenshotUrl,
    currentPageUrl: store.currentPageUrl,
    events: store.events,
    isComplete: store.isComplete,
    error: store.error,
    handleEvent: store.handleEvent,
    reset: store.reset,
  };
}
