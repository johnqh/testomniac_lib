import { useCallback, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { GenerateSequenceResponse } from '@sudobility/testomniac_types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { TestomniacClient } from '@sudobility/testomniac_client';

interface UseSequenceGeneratorConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  token: FirebaseIdToken;
}

export function useSequenceGenerator(config: UseSequenceGeneratorConfig) {
  const { networkClient, baseUrl, token } = config;
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateSequenceResponse | null>(null);

  const generate = useCallback(
    async (scenarioId: number, testEnvironmentId: number) => {
      setIsGenerating(true);
      setError(null);
      setResult(null);
      try {
        const client = new TestomniacClient({ networkClient, baseUrl });
        const response = await client.generateSequence(
          scenarioId,
          { testEnvironmentId },
          token
        );
        if (response.success && response.data) {
          setResult(response.data);
          return response.data;
        }
        const msg = response.error ?? 'Failed to generate sequence';
        setError(msg);
        return null;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to generate sequence';
        setError(msg);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [networkClient, baseUrl, token]
  );

  return { generate, isGenerating, error, result };
}
