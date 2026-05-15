import { useMemo } from 'react';
import type { TestRunResponse } from '@sudobility/testomniac_types';

export interface StatusCounts {
  completed: number;
  passed: number;
  failed: number;
  error: number;
  running: number;
  pending: number;
  planned: number;
  other: number;
}

export interface TestRunsAnalysis {
  statusCounts: StatusCounts;
}

/**
 * Compute aggregated status counts for a list of test runs.
 *
 * Statuses that don't match any known key are bucketed into `other`.
 */
export function useTestRunsAnalysis(
  testRuns: TestRunResponse[]
): TestRunsAnalysis {
  const statusCounts = useMemo(() => {
    const counts: StatusCounts = {
      completed: 0,
      passed: 0,
      failed: 0,
      error: 0,
      running: 0,
      pending: 0,
      planned: 0,
      other: 0,
    };
    for (const run of testRuns) {
      const s = run.status as keyof StatusCounts;
      if (s in counts) {
        counts[s]++;
      } else {
        counts.other++;
      }
    }
    return counts;
  }, [testRuns]);

  return { statusCounts };
}
