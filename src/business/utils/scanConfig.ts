/**
 * Shared scan-configuration constants used by both the extension side panel and
 * the dashboard "create product" flow. Keeping these here (rather than in each
 * UI) ensures the expertise list and scan-depth options stay in lockstep.
 */

export interface ExpertiseOption {
  /** Server-side expertise slug. */
  slug: string;
  /** Human-readable label. */
  label: string;
  /** When true the expertise is always selected and cannot be unchecked. */
  required?: boolean;
}

/** The expertises a discovery run can evaluate. `tester` is always required. */
export const EXPERTISE_OPTIONS: ExpertiseOption[] = [
  { slug: 'tester', label: 'Tester', required: true },
  { slug: 'seo', label: 'SEO' },
  { slug: 'security', label: 'Security' },
  { slug: 'performance', label: 'Performance' },
  { slug: 'content', label: 'Content' },
  { slug: 'ui', label: 'UI' },
  { slug: 'accessibility', label: 'Accessibility' },
];

/** The slugs selected by default (the required `tester` expertise). */
export const DEFAULT_EXPERTISE_SLUGS: string[] = EXPERTISE_OPTIONS.filter(
  o => o.required
).map(o => o.slug);

/** Scan depth — how exhaustively a run exercises each surface. */
export type ScanMode = 'full' | 'partial' | 'minimum';

export interface ScanModeOption {
  value: ScanMode;
  label: string;
  /** Short explanation shown beneath the selector. */
  description: string;
}

export const SCAN_MODE_OPTIONS: ScanModeOption[] = [
  {
    value: 'full',
    label: 'Full',
    description: 'Run all interactions including hover',
  },
  {
    value: 'partial',
    label: 'Partial',
    description: 'Skip hover interactions',
  },
  {
    value: 'minimum',
    label: 'Minimum',
    description: 'Navigation only — fastest',
  },
];

/** Type guard for persisted/untrusted scan-mode values. */
export function isScanMode(value: unknown): value is ScanMode {
  return (
    typeof value === 'string' &&
    (value === 'full' || value === 'partial' || value === 'minimum')
  );
}
