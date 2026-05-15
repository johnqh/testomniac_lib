/**
 * Check whether the domain of `email` matches the domain of `url`.
 *
 * The comparison extracts the registrable domain (last two labels) from both
 * sides.  An email domain that is a subdomain of the URL domain is also
 * considered a match (e.g. "user@sub.example.com" matches "https://example.com").
 *
 * Returns `true` when `email` is empty (nothing to validate) or when the
 * domains match.  Returns `false` when the URL cannot be parsed or the domains
 * do not match.
 */
export function validateEmailDomain(email: string, url: string): boolean {
  if (!email) return true;
  try {
    const urlDomain = new URL(url).hostname.split('.').slice(-2).join('.');
    const emailDomain = email.split('@')[1]?.toLowerCase();
    return emailDomain === urlDomain || emailDomain?.endsWith(`.${urlDomain}`);
  } catch {
    return false;
  }
}
