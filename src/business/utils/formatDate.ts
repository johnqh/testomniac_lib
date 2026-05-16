export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '\u2014';
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
}
