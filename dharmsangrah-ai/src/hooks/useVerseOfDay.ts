'use client';

// ─── useVerseOfDay ────────────────────────────────────────────────────────────
// Deterministically picks a "verse of the day" from the featured verse list.
// Uses the date as a seed so the same verse shows all day for all users,
// without a dedicated backend endpoint.
//
// In production, replace with a real /api/v1/verses/featured endpoint.

import useSWR from 'swr';
import { verseAPI } from '@/lib/api/client';
import type { Verse } from '@/types';

// Curated featured verse refs — one per week of the year (52 items covers all)
const FEATURED_VERSES = [
  'BG_2.47', 'BG_2.20', 'BG_3.19', 'BG_4.7',  'BG_6.5',
  'BG_6.19', 'BG_8.7',  'BG_9.22', 'BG_10.8', 'BG_11.33',
  'BG_12.13','BG_13.27','BG_14.22','BG_15.15','BG_16.3',
  'BG_17.3', 'BG_18.66','BG_2.14', 'BG_3.27', 'BG_4.18',
  'BG_5.18', 'BG_6.34', 'BG_7.19', 'BG_9.27', 'BG_10.20',
  'BG_12.15','BG_13.13','BG_15.7', 'BG_16.21','BG_18.20',
];

function getTodaysVerseRef(): string {
  const now     = new Date();
  // Day of year as seed — deterministic, resets annually
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVerseOfDayReturn {
  verse:     Verse | null;
  isLoading: boolean;
  isError:   boolean;
}

export function useVerseOfDay(): UseVerseOfDayReturn {
  const verseRef = getTodaysVerseRef();

  const { data, error, isLoading } = useSWR<Verse>(
    `verse-${verseRef}`,
    () => verseAPI.get(verseRef),
    {
      // Verse data is immutable — cache for 24 hours
      dedupingInterval: 24 * 60 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    verse:     data ?? null,
    isLoading,
    isError:   Boolean(error),
  };
}
