import {
  getExpertiseRuleDefinition,
  type TestRunFindingResponse,
} from '@sudobility/testomniac_types';
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
  if (finding.expertiseId) {
    return finding.expertiseId;
  }

  if (finding.ruleId) {
    return getExpertiseRuleDefinition(finding.ruleId)?.expertiseId ?? null;
  }

  return parseExpertiseTitle(finding.title).tag;
}

export function getFindingDisplayTitle(
  finding: TestRunFindingResponse
): string {
  if (finding.ruleId) {
    return (
      getExpertiseRuleDefinition(finding.ruleId)?.label ??
      legacyFindingTitle(finding)
    );
  }

  return legacyFindingTitle(finding);
}

export function getFindingRemediation(
  finding: TestRunFindingResponse
): string | null {
  return finding.ruleId
    ? (getExpertiseRuleDefinition(finding.ruleId)?.remediation ?? null)
    : null;
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
