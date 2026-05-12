import { useMemo } from 'react';
import type {
  PageResponse,
  TestInteractionResponse,
} from '@sudobility/testomniac_types';

export interface PageMapNode {
  id: string;
  relativePath: string;
  routeKey: string | null;
  isExternal: boolean;
  testInteractionCount: number;
}

export interface PageMapEdge {
  id: string;
  sourcePageId: number | null;
  targetPageId: number | null;
  testInteractionId: number;
  testType: string;
  title: string;
}

export interface UsePageMapDataConfig {
  pages: PageResponse[];
  testInteractions: TestInteractionResponse[];
}

const MAP_TEST_TYPES = new Set(['navigation', 'interaction']);

export function usePageMapData({
  pages,
  testInteractions,
}: UsePageMapDataConfig) {
  return useMemo(() => {
    // Filter to navigation and interaction types only,
    // exclude self-referencing elements, and require a targetPageId
    const filtered = testInteractions.filter(
      el =>
        MAP_TEST_TYPES.has(el.testType) &&
        el.targetPageId != null &&
        el.pageId !== el.targetPageId
    );

    // Count test elements per page (both as source and target)
    const countMap = new Map<number, number>();
    for (const el of filtered) {
      if (el.pageId != null) {
        countMap.set(el.pageId, (countMap.get(el.pageId) ?? 0) + 1);
      }
      if (el.targetPageId != null) {
        countMap.set(el.targetPageId, (countMap.get(el.targetPageId) ?? 0) + 1);
      }
    }

    // Build nodes from pages
    const nodes: PageMapNode[] = pages.map(page => ({
      id: String(page.id),
      relativePath: page.relativePath,
      routeKey: page.routeKey,
      isExternal: page.relativePath.startsWith('http'),
      testInteractionCount: countMap.get(page.id) ?? 0,
    }));

    // Build edges from filtered test elements
    const edges: PageMapEdge[] = filtered.map(el => ({
      id: String(el.id),
      sourcePageId: el.testType === 'navigation' ? null : el.pageId,
      targetPageId: el.targetPageId,
      testInteractionId: el.id,
      testType: el.testType,
      title: el.title,
    }));

    return { nodes, edges };
  }, [pages, testInteractions]);
}
