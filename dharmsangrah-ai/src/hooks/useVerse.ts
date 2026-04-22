'use client';

// ─── useVerse ────────────────────────────────────────────────────────────────
// SWR hook for fetching a single verse. Verse data is immutable (canonical texts),
// so we use a very long cache TTL and disable revalidation on focus.

import useSWR from 'swr';
import { verseAPI } from '@/lib/api/client';
import type { Verse } from '@/types';

interface UseVerseReturn {
  verse:     Verse | null;
  isLoading: boolean;
  isError:   boolean;
}

export function useVerse(verseRef: string | null): UseVerseReturn {
  const { data, error, isLoading } = useSWR<Verse>(
    verseRef ? `verse-${verseRef}` : null,
    () => verseAPI.get(verseRef!),
    {
      dedupingInterval:  24 * 60 * 60 * 1000, // 24 hours
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    verse:     data ?? null,
    isLoading,
    isError:   Boolean(error),
  };
}
