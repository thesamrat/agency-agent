'use client';

// ─── App Providers ────────────────────────────────────────────────────────────
// Composes all client-side providers without polluting the server layout.

import type { ReactNode } from 'react';
import { SWRProvider } from '@/lib/swr-config';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRProvider>
      {children}
    </SWRProvider>
  );
}
