import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { ProductSummaryResponse } from '@sudobility/testomniac_types';
import type { FirebaseIdToken } from '@sudobility/testomniac_client';
import { TestomniacClient } from '@sudobility/testomniac_client';

interface UseDashboardManagerConfig {
  networkClient: NetworkClient;
  baseUrl: string;
  entitySlug: string;
  token: FirebaseIdToken;
  enabled?: boolean;
}

export function useDashboardManager(config: UseDashboardManagerConfig) {
  const { networkClient, baseUrl, entitySlug, token, enabled = true } = config;

  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => new TestomniacClient({ networkClient, baseUrl }),
    [networkClient, baseUrl]
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.getEntityProducts(entitySlug, token);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch products')
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, entitySlug, token]);

  useEffect(() => {
    if (enabled) {
      void fetchProducts();
    }
  }, [enabled, fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetchProducts: fetchProducts,
  };
}
