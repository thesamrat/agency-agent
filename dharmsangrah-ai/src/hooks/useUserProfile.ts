'use client';

// ─── useUserProfile ───────────────────────────────────────────────────────────
// SWR-powered hook to fetch and cache the authenticated user's profile.
// Returns null profile when unauthenticated — never throws.

import useSWR from 'swr';
import { authAPI } from '@/lib/api/client';
import type { UserProfile } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseUserProfileReturn {
  profile:   UserProfile | null;
  isLoading: boolean;
  isError:   boolean;
  mutate:    () => void;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchProfile(): Promise<UserProfile | null> {
  // If there's no token in localStorage, skip the request entirely
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('sb-auth-token');
    if (!raw) return null;
  }

  try {
    return await authAPI.me();
  } catch (err: unknown) {
    // 401 = not authenticated — return null gracefully
    const apiErr = err as { status?: number };
    if (apiErr?.status === 401) return null;
    throw err;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserProfile(): UseUserProfileReturn {
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
    'user-profile',
    fetchProfile,
    {
      // Revalidate on window focus to pick up subscription changes
      revalidateOnFocus: true,
      // Cache for 5 minutes; short TTL so usage count stays fresh
      dedupingInterval: 5 * 60 * 1000,
      // Don't retry on 401 — it's expected for guests
      shouldRetryOnError: false,
    }
  );

  return {
    profile:   data ?? null,
    isLoading,
    isError:   Boolean(error),
    mutate,
  };
}
