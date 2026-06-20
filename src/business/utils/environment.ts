import type { EnvironmentKind } from '@sudobility/testomniac_types';

/**
 * URL → test-environment resolution helpers, shared between the extension side
 * panel and the dashboard "create product" flow. Ported from the extension's
 * `src/shared/environment.ts` so both surfaces classify environments
 * identically (local vs shared, and the chosen label).
 */

export type EnvironmentChoice = 'production' | 'staging' | 'qa' | 'custom';

export interface EnvironmentOption {
  value: EnvironmentChoice;
  label: string;
}

export interface UrlEnvironmentInfo {
  hostname: string | null;
  isLocalEnvironment: boolean;
}

export interface EnvironmentContext extends UrlEnvironmentInfo {
  kind: EnvironmentKind;
  label: string;
}

/** Hostnames treated as the user's local environment. */
export const LOCAL_ENV_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Selectable labels for a non-local (shared) environment. */
export const environmentOptions: EnvironmentOption[] = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'qa', label: 'QA' },
  { value: 'custom', label: 'Custom Label' },
];

/** Parse a URL into its hostname and whether it points at a local host. */
export function getUrlEnvironmentInfo(url: string | null): UrlEnvironmentInfo {
  if (!url) {
    return { hostname: null, isLocalEnvironment: false };
  }
  try {
    const parsed = new URL(url);
    return {
      hostname: parsed.hostname,
      isLocalEnvironment: LOCAL_ENV_HOSTS.has(parsed.hostname),
    };
  } catch {
    return { hostname: null, isLocalEnvironment: false };
  }
}

/**
 * Derive the environment kind + label for a URL. Local hosts always resolve to
 * a `local` environment; otherwise the caller's selected label (or a custom
 * one) is used for a `shared` environment.
 */
export function resolveEnvironmentContext(
  url: string | null,
  selectedEnvironment: EnvironmentChoice,
  customEnvironmentLabel: string
): EnvironmentContext {
  const info = getUrlEnvironmentInfo(url);

  if (info.isLocalEnvironment) {
    return { ...info, kind: 'local', label: 'local' };
  }

  return {
    ...info,
    kind: 'shared',
    label:
      selectedEnvironment === 'custom'
        ? customEnvironmentLabel.trim()
        : selectedEnvironment,
  };
}
