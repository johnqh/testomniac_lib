import type { TestRunFindingResponse } from '@sudobility/testomniac_types';
import { parseExpertiseTitle } from './parseExpertiseTitle';

function legacyFindingTitle(finding: TestRunFindingResponse): string {
  return (
    parseExpertiseTitle(finding.title).title.trim() || finding.title.trim()
  );
}

export function getFindingRuleKey(finding: TestRunFindingResponse): string {
  if (finding.ruleId) {
    return `rule:${finding.ruleId}`;
  }

  return [
    'legacy',
    finding.type,
    finding.priority,
    finding.path ?? '',
    legacyFindingTitle(finding).toLowerCase(),
  ].join(':');
}

export function getFindingExpertiseSlug(
  finding: TestRunFindingResponse
): string | null {
  if (finding.ruleId) {
    const [slug] = finding.ruleId.split('.');
    return slug || null;
  }

  return parseExpertiseTitle(finding.title).tag;
}

export function getFindingDisplayTitle(
  finding: TestRunFindingResponse
): string {
  return legacyFindingTitle(finding);
}

export function groupFindingsByRule(
  findings: TestRunFindingResponse[]
): Map<string, TestRunFindingResponse[]> {
  const groups = new Map<string, TestRunFindingResponse[]>();

  for (const finding of findings) {
    const key = getFindingRuleKey(finding);
    const group = groups.get(key);
    if (group) {
      group.push(finding);
    } else {
      groups.set(key, [finding]);
    }
  }

  return groups;
}
