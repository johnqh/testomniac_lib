import { useCallback, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  CreateDiscoveryRunRequest,
  EnvironmentKind,
  UserData,
} from '@sudobility/testomniac_types';
import {
  useCreateProduct,
  useResolveTestEnvironment,
  useSubmitScan,
  useUpdateEnvironmentUserData,
} from '@sudobility/testomniac_client';
import type { ScanMode } from '../utils/scanConfig';

export interface StartProductScanParams {
  /** Target URL to scan (also used to derive the product title + origin). */
  url: string;
  /** Product title; defaults to the URL hostname when omitted. */
  title?: string;
  /** Expertise slugs to run (always includes `tester`). */
  expertiseSlugs: string[];
  /** Resolved environment label (e.g. `production`, a custom label, or `local`). */
  environmentLabel: string;
  /** Resolved environment kind. */
  environmentKind: EnvironmentKind;
  /** Scan depth. */
  scanMode: ScanMode;
  /** When true, persist credentials and pass `continueWithLogin` to the run. */
  continueWithLogin?: boolean;
  /** Optional login URL used when `continueWithLogin` is set. */
  loginUrl?: string;
  /** Optional environment user-data (credentials JSON) to persist before scanning. */
  userData?: UserData | null;
}

export interface StartProductScanResult {
  productId: number;
  testEnvironmentId: number;
  testRunId: number;
}

export interface UseCreateProductFlowConfig {
  networkClient: NetworkClient;
  /** API origin (e.g. `https://api.testomniac.com`); hooks add `/api/v1` themselves. */
  baseUrl: string;
  /** Firebase ID token. */
  token: string;
  /** Workspace (entity) id/slug the new product belongs to. */
  entityId: string;
}

export interface UseCreateProductFlow {
  startScan: (
    params: StartProductScanParams
  ) => Promise<StartProductScanResult | null>;
  isSubmitting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Orchestrates "create a product and start a discovery run" from a dashboard
 * (no local runner). Mirrors the extension's submit flow, with one key
 * difference: the run is created WITHOUT an owner, so the server-side runner
 * (`testomniac_runner`) claims it from the unowned `/pending` queue. The
 * extension, by contrast, owns its runs and executes them locally.
 *
 * Sequence: create product → resolve test environment (`source: 'server'`) →
 * optionally persist environment user-data → submit discovery run (omitting
 * `ownedByUserId`, so the server leaves it null).
 */
export function useCreateProductFlow(
  config: UseCreateProductFlowConfig
): UseCreateProductFlow {
  const { networkClient, baseUrl, token, entityId } = config;

  const createProduct = useCreateProduct(networkClient, baseUrl);
  const resolveEnvironment = useResolveTestEnvironment(networkClient, baseUrl);
  const updateUserData = useUpdateEnvironmentUserData(networkClient, baseUrl);
  const submitScan = useSubmitScan(networkClient, baseUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(
    async (
      params: StartProductScanParams
    ): Promise<StartProductScanResult | null> => {
      setError(null);
      setIsSubmitting(true);
      try {
        let origin: string;
        let hostname: string;
        try {
          const parsed = new URL(params.url);
          origin = parsed.origin;
          hostname = parsed.hostname;
        } catch {
          setError('Enter a valid URL (including https://).');
          return null;
        }

        // 1. Create the product under the selected workspace.
        const title = params.title?.trim() || hostname;
        const created = await createProduct.mutateAsync({
          token,
          data: { entityId, title },
        });
        if (!created.success || !created.data?.id) {
          setError(created.error ?? 'Failed to create product');
          return null;
        }
        const productId = created.data.id;

        // 2. Resolve (create) the test environment for this URL. `source:
        //    'server'` marks it as an app-originated environment.
        const envRes = await resolveEnvironment.mutateAsync({
          token,
          data: {
            productId,
            url: params.url,
            baseUrl: origin,
            source: 'server',
            environmentLabel:
              params.environmentKind === 'local'
                ? undefined
                : params.environmentLabel,
          },
        });
        if (!envRes.success || !envRes.data?.testEnvironmentId) {
          setError(envRes.error ?? 'Failed to resolve scan environment');
          return null;
        }
        const testEnvironmentId = envRes.data.testEnvironmentId;

        // 3. Persist environment user-data (credentials JSON) if provided.
        if (params.userData && Object.keys(params.userData).length > 0) {
          await updateUserData.mutateAsync({
            token,
            environmentId: testEnvironmentId,
            data: params.userData,
          });
        }

        // 4. Submit the discovery run WITHOUT an owner. The server defaults
        //    createdByUserId to the authed user and leaves ownedByUserId null,
        //    so the run lands unowned in the `/pending` queue for the
        //    server-side runner to claim.
        const scanBody: CreateDiscoveryRunRequest = {
          url: params.url,
          productId,
          testEnvironmentId,
          expertiseSlugs: params.expertiseSlugs,
          environmentLabel: params.environmentLabel,
          environmentKind: params.environmentKind,
          ...(params.scanMode !== 'full' ? { scanMode: params.scanMode } : {}),
          ...(params.continueWithLogin
            ? {
                continueWithLogin: true,
                ...(params.loginUrl?.trim()
                  ? { loginUrl: params.loginUrl.trim() }
                  : {}),
              }
            : {}),
        };
        const scanRes = await submitScan.mutateAsync(scanBody);
        if (!scanRes.success || !scanRes.data?.testRunId) {
          setError(
            scanRes.error ?? scanRes.data?.message ?? 'Failed to start scan'
          );
          return null;
        }

        return {
          productId,
          testEnvironmentId,
          testRunId: scanRes.data.testRunId,
        };
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to start scan');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      createProduct,
      resolveEnvironment,
      updateUserData,
      submitScan,
      token,
      entityId,
    ]
  );

  return { startScan, isSubmitting, error, setError };
}
