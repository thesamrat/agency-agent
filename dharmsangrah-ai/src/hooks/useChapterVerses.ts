'use client';

// ─── useChapterVerses ─────────────────────────────────────────────────────────
// Infinite-scroll pagination hook for verses in a chapter.

import useSWRInfinite from 'swr/infinite';
import { verseAPI } from '@/lib/api/client';
import type { PaginatedResponse, Verse } from '@/types';

const PER_PAGE = 20;

interface UseChapterVersesReturn {
  verses:     Verse[];
  isLoading:  boolean;
  isError:    boolean;
  hasMore:    boolean;
  loadMore:   () => void;
  total:      number;
}

export function useChapterVerses(chapterNumber: number): UseChapterVersesReturn {
  const getKey = (pageIndex: number) =>
    chapterNumber
      ? `chapter-${chapterNumber}-verses-page-${pageIndex + 1}`
      : null;

  const { data, error, isLoading, size, setSize } = useSWRInfinite<PaginatedResponse<Verse>>(
    getKey,
    (key: string) => {
      const page = parseInt(key.split('page-')[1], 10);
      return verseAPI.listByChapter(chapterNumber, page, PER_PAGE);
    },
    {
      revalidateOnFocus: false,
      // Keep previous data while loading next page
      keepPreviousData: true,
    }
  );

  const verses  = data ? data.flatMap((page) => page.data) : [];
  const total   = data?.[0]?.total ?? 0;
  const hasMore = data ? data[data.length - 1]?.has_next : false;

  return {
    verses,
    isLoading,
    isError: Boolean(error),
    hasMore: hasMore ?? false,
    loadMore: () => setSize(size + 1),
    total,
  };
}
