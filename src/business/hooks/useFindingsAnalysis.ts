import { useMemo } from 'react';
import type { TestRunFindingResponse } from '@sudobility/testomniac_types';

export interface FindingsAnalysis {
  /** Count of findings per priority level (0-4). */
  priorityCounts: Record<number, number>;
  /** Total number of findings with type "error". */
  errorCount: number;
  /** Total number of findings with type "warning". */
  warningCount: number;
  /** The subset of findings that match the active type and priority filters. */
  filteredFindings: TestRunFindingResponse[];
}

/**
 * Derive priority/type counts and apply optional filters over a findings list.
 *
 * Pass `null` for either filter parameter to skip that filter dimension.
 */
export function useFindingsAnalysis(
  findings: TestRunFindingResponse[],
  typeFilter: string | null,
  priorityFilter: number | null
): FindingsAnalysis {
  const priorityCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const f of findings) {
      const p = f.priority;
      if (p in counts) counts[p]++;
    }
    return counts;
  }, [findings]);

  const errorCount = useMemo(
    () => findings.filter(f => f.type === 'error').length,
    [findings]
  );

  const warningCount = useMemo(
    () => findings.filter(f => f.type === 'warning').length,
    [findings]
  );

  const filteredFindings = useMemo(() => {
    let result = findings;
    if (typeFilter !== null) {
      result = result.filter(f => f.type === typeFilter);
    }
    if (priorityFilter !== null) {
      result = result.filter(f => f.priority === priorityFilter);
    }
    return result;
  }, [findings, typeFilter, priorityFilter]);

  return { priorityCounts, errorCount, warningCount, filteredFindings };
}
