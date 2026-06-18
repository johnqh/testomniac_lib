/**
 * Finding/issue priority semantics, shared across clients.
 *
 * Priority is an integer 0..4 where lower is more severe. These helpers encode
 * the canonical names, labels, and the test-surface priority banding rules so
 * every UI renders the same vocabulary instead of hard-coding it.
 */

/** Canonical priority levels, most to least severe. */
export const PRIORITY_LEVELS = [0, 1, 2, 3, 4] as const;

/** Lowercase severity name for each priority level. */
export const PRIORITY_NAMES: Record<number, string> = {
  0: 'crash',
  1: 'critical',
  2: 'major',
  3: 'minor',
  4: 'suggestion',
};

/** Short label, e.g. `"P0"`. */
export function priorityShortLabel(priority: number): string {
  return `P${priority}`;
}

/** Full label, e.g. `"P0 - Crash"`. Falls back to `"P{n}"` for unknown levels. */
export function priorityLabel(priority: number): string {
  const name = PRIORITY_NAMES[priority];
  if (!name) return `P${priority}`;
  return `P${priority} - ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

/**
 * Coarse priority band used to filter/group test surfaces by their numeric
 * `priority` score (higher score = more important):
 * `critical` (>= 8), `high` (5-7), `medium` (3-4), `low` (< 3).
 */
export type SurfacePriorityBand = 'critical' | 'high' | 'medium' | 'low';

export function getSurfacePriorityBand(priority: number): SurfacePriorityBand {
  if (priority >= 8) return 'critical';
  if (priority >= 5) return 'high';
  if (priority >= 3) return 'medium';
  return 'low';
}
