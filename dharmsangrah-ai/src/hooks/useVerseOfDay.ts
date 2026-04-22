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
  'BG 2.47', 'BG 2.20', 'BG 3.19', 'BG 4.7',  'BG 6.5',
  'BG 6.19', 'BG 8.7',  'BG 9.22', 'BG 10.8', 'BG 11.33',
  'BG 12.13','BG 13.27','BG 14.22','BG 15.15','BG 16.3',
  'BG 17.3', 'BG 18.66','BG 2.14', 'BG 3.27', 'BG 4.18',
  'BG 5.18', 'BG 6.34', 'BG 7.19', 'BG 9.27', 'BG 10.20',
  'BG 12.15','BG 13.13','BG 15.7', 'BG 16.21','BG 18.20',
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
