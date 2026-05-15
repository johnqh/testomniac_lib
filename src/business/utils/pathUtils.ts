/**
 * Normalize a URL or path string into a bare pathname.
 *
 * Strips query params, hashes, and trailing slashes.  Handles both full URLs
 * and relative path strings.  Returns `null` for falsy input.
 */
export function normalizePath(path: string | null | undefined): string | null {
  if (!path) return null;

  const normalizeValue = (value: string) => {
    if (value.length > 1 && value.endsWith('/')) {
      return value.replace(/\/+$/, '');
    }
    return value || '/';
  };

  try {
    const parsed = new URL(path);
    return normalizeValue(parsed.pathname || '/');
  } catch {
    const [pathname] = path.split(/[?#]/, 1);
    if (!pathname) return null;
    if (pathname.startsWith('/')) return normalizeValue(pathname);
    return normalizeValue(`/${pathname}`);
  }
}

/**
 * Replace dynamic path segments with `:param` placeholders.
 *
 * Collapses purely numeric segments, UUIDs, and long hex strings (>= 12 chars)
 * so that parameterised URLs can be grouped together.
 */
export function patternizePath(pathname: string): string {
  const segments = pathname.split('/');
  const result = segments.map(seg => {
    if (!seg) return seg;
    // Purely numeric (e.g. /products/42)
    if (/^\d+$/.test(seg)) return ':param';
    // UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        seg
      )
    )
      return ':param';
    // Long hex string (>= 12 chars, e.g. hash-based IDs)
    if (/^[0-9a-f]{12,}$/i.test(seg)) return ':param';
    return seg;
  });
  return result.join('/') || '/';
}
