import { useMemo } from 'react';
import type { TestInteractionResponse } from '@sudobility/testomniac_types';

export interface PageInteractionGroups {
  /** Interactions that start AND land on this page (source = target = pageId). */
  onPageElements: TestInteractionResponse[];
  /** Interactions that start on this page but land elsewhere. */
  startingElements: TestInteractionResponse[];
  /** Interactions that land on this page but start elsewhere. */
  landingElements: TestInteractionResponse[];
}

/**
 * Split a list of test interactions into three groups relative to a given page:
 * those starting from the page, those landing on it, and those that stay on it.
 */
export function usePageInteractionGroups(
  testInteractions: TestInteractionResponse[],
  pageId: number
): PageInteractionGroups {
  return useMemo(() => {
    const starting: TestInteractionResponse[] = [];
    const landing: TestInteractionResponse[] = [];
    const onPage: TestInteractionResponse[] = [];

    for (const el of testInteractions) {
      const isSource = el.pageId === pageId;
      const isTarget = el.targetPageId === pageId;

      if (isSource && isTarget) {
        onPage.push(el);
      } else if (isSource) {
        starting.push(el);
      } else if (isTarget) {
        landing.push(el);
      }
    }

    return {
      startingElements: starting,
      landingElements: landing,
      onPageElements: onPage,
    };
  }, [testInteractions, pageId]);
}
