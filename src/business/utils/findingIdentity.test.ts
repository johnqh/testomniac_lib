import { describe, expect, it } from 'vitest';
import {
  ExpertiseRuleId,
  type TestRunFindingResponse,
} from '@sudobility/testomniac_types';
import {
  getFindingDisplayTitle,
  getFindingExpertiseSlug,
  getFindingRemediation,
  getFindingRuleKey,
  groupFindingsByRule,
} from './findingIdentity';

function finding(
  overrides: Partial<TestRunFindingResponse>
): TestRunFindingResponse {
  return {
    id: 1,
    testRunId: 10,
    path: '/checkout',
    expertiseRuleId: null,
    expertiseId: null,
    ruleId: null,
    type: 'warning',
    priority: 2,
    title: '[content] Placeholder copy',
    description: 'Description',
    interactionRunIds: [20],
    createdAt: null,
    ...overrides,
  };
}

describe('findingIdentity', () => {
  it('uses ruleId as the stable grouping key when present', () => {
    const item = finding({
      ruleId: ExpertiseRuleId.ContentPlaceholderCopy,
      title: '[content] Placeholder copy changed',
    });

    expect(getFindingRuleKey(item)).toBe(
      `rule:${ExpertiseRuleId.ContentPlaceholderCopy}`
    );
  });

  it('falls back to legacy title/type/priority/path identity for old findings', () => {
    expect(getFindingRuleKey(finding({ id: 2 }))).toBe(
      'legacy:warning:2:/checkout:placeholder copy'
    );
  });

  it('derives expertise from ruleId before parsing the title prefix', () => {
    const item = finding({
      ruleId: ExpertiseRuleId.SeoTitlePresent,
      title: '[content] Missing title',
    });

    expect(getFindingExpertiseSlug(item)).toBe('seo');
  });

  it('uses the persisted expertise ID before legacy fallbacks', () => {
    expect(
      getFindingExpertiseSlug(
        finding({ expertiseId: 'accessibility', title: '[seo] Missing label' })
      )
    ).toBe('accessibility');
  });

  it('uses catalog metadata for a stable rule', () => {
    const item = finding({ ruleId: ExpertiseRuleId.SeoTitlePresent });
    expect(getFindingDisplayTitle(item)).toBe('Title: Present');
    expect(getFindingRemediation(item)).toContain('title');
  });

  it('falls back to bracketed expertise for legacy findings', () => {
    expect(
      getFindingExpertiseSlug(finding({ title: '[ui] Button overlap' }))
    ).toBe('ui');
  });

  it('keeps display titles friendly by stripping legacy expertise prefixes', () => {
    expect(
      getFindingDisplayTitle(
        finding({ title: '[accessibility] Missing label' })
      )
    ).toBe('Missing label');
  });

  it('groups mixed old and new findings without merging unrelated legacy records', () => {
    const groups = groupFindingsByRule([
      finding({
        id: 1,
        ruleId: ExpertiseRuleId.ContentPlaceholderCopy,
        title: 'Placeholder',
      }),
      finding({
        id: 2,
        ruleId: ExpertiseRuleId.ContentPlaceholderCopy,
        title: 'Copy placeholder',
      }),
      finding({ id: 3, ruleId: null, title: '[content] Placeholder copy' }),
      finding({
        id: 4,
        ruleId: null,
        title: '[content] Placeholder copy',
        path: '/pricing',
      }),
    ]);

    expect(
      groups
        .get(`rule:${ExpertiseRuleId.ContentPlaceholderCopy}`)
        ?.map(f => f.id)
    ).toEqual([1, 2]);
    expect(
      groups.get('legacy:warning:2:/checkout:placeholder copy')?.map(f => f.id)
    ).toEqual([3]);
    expect(
      groups.get('legacy:warning:2:/pricing:placeholder copy')?.map(f => f.id)
    ).toEqual([4]);
  });
});
