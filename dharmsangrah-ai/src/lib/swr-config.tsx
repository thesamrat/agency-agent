'use client';

// ─── SWR Global Configuration ─────────────────────────────────────────────────
// Provides global SWR config with sensible defaults for Dharmsangrah.ai.

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Default fetcher (most hooks define their own; this is a safety net)
        fetcher: (url: string) =>
          fetch(url).then((r) => {
            if (!r.ok) throw new Error(`Fetch error: ${r.status}`);
            return r.json();
          }),

        // Global revalidation settings
        revalidateOnFocus:      true,
        revalidateOnReconnect:  true,

        // 2-second dedup window for rapid repeated calls
        dedupingInterval: 2_000,

        // Retry config — exponential backoff, max 3 retries
        errorRetryCount:    3,
        errorRetryInterval: 1_000,

        // Keep stale data while revalidating (avoids loading flicker)
        keepPreviousData: true,

        // Global error handler — swallow errors gracefully, let components handle
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[SWR] Error for key "${key}":`, error);
          }
          // In production, errors bubble to each hook's `isError` state
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
