/**
 * Parse a finding title of the form `[expertise-name] Actual title` into its
 * tag and display title components.
 *
 * If the raw string does not match the bracketed prefix pattern, `tag` is null
 * and `title` is the original string.
 */
export function parseExpertiseTitle(raw: string): {
  tag: string | null;
  title: string;
} {
  const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    return { tag: match[1], title: match[2] };
  }
  return { tag: null, title: raw };
}
