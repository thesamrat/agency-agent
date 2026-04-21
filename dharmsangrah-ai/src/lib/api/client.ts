// ─── API Client ───────────────────────────────────────────────────────────────
// Thin fetch wrapper with auth injection, error normalisation, and SSE helpers.

import type {
  Verse,
  Chapter,
  SearchResponse,
  SearchFilters,
  ShareCardRequest,
  ShareCardResponse,
  UserProfile,
  AIQueryRequest,
  ReadingHistoryEntry,
  PaginatedResponse,
  APIError,
} from '@/types';

const BASE_URL = '/api/v1';

// ─── Auth Token Provider ──────────────────────────────────────────────────────
// Supabase stores session in localStorage; we read it lazily so SSR is safe.

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sb-auth-token');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
  });

  if (!res.ok) {
    let err: APIError;
    try {
      err = await res.json();
    } catch {
      err = { code: 'UNKNOWN', message: res.statusText, status: res.status };
    }
    throw err;
  }

  return res.json() as Promise<T>;
}

// ─── Verse API ────────────────────────────────────────────────────────────────

export const verseAPI = {
  get: (verseRef: string) =>
    apiFetch<Verse>(`/verses/${encodeURIComponent(verseRef)}`),

  listByChapter: (chapterNumber: number, page = 1, perPage = 20) =>
    apiFetch<PaginatedResponse<Verse>>(
      `/chapters/${chapterNumber}/verses?page=${page}&per_page=${perPage}`
    ),
};

// ─── Chapter API ──────────────────────────────────────────────────────────────

export const chapterAPI = {
  list: () => apiFetch<Chapter[]>('/chapters'),
  get: (number: number) => apiFetch<Chapter>(`/chapters/${number}`),
};

// ─── Search API ───────────────────────────────────────────────────────────────

export const searchAPI = {
  query: (q: string, filters: Partial<SearchFilters> = {}) => {
    const params = new URLSearchParams({ q, type: filters.type ?? 'semantic' });
    if (filters.chapter) params.set('chapter', String(filters.chapter));
    if (filters.commentator) params.set('commentator', filters.commentator);
    return apiFetch<SearchResponse>(`/search?${params.toString()}`);
  },
};

// ─── AI Query (SSE) ───────────────────────────────────────────────────────────

export interface SSECallbacks {
  onChunk: (text: string) => void;
  onCitations: (citations: import('@/types').Citation[]) => void;
  onDone: (interactionId: string, tokensUsed: number) => void;
  onError: (err: Error) => void;
}

export function streamAIQuery(
  request: AIQueryRequest,
  callbacks: SSECallbacks,
  signal?: AbortSignal
): void {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  fetch(`${BASE_URL}/ai/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        callbacks.onError(new Error(err.message ?? 'AI query failed'));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        callbacks.onError(new Error('No response body'));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const eventLine = part.match(/^event: (.+)$/m)?.[1];
          const dataLine = part.match(/^data: (.+)$/m)?.[1];
          if (!dataLine) continue;

          try {
            const payload = JSON.parse(dataLine);
            if (eventLine === 'chunk') callbacks.onChunk(payload.text);
            else if (eventLine === 'citations') callbacks.onCitations(payload.citations);
            else if (eventLine === 'done') callbacks.onDone(payload.interaction_id, payload.tokens_used);
          } catch {
            // Malformed SSE line — ignore and continue
          }
        }
      }
    })
    .catch((err) => {
      if ((err as Error).name !== 'AbortError') {
        callbacks.onError(err as Error);
      }
    });
}

// ─── Share API ────────────────────────────────────────────────────────────────

export const shareAPI = {
  generate: (request: ShareCardRequest) =>
    apiFetch<ShareCardResponse>('/shares', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

// ─── Reading History ──────────────────────────────────────────────────────────
// Fire-and-forget — we never await or show errors from this.

export function trackReading(entry: ReadingHistoryEntry): void {
  const token = getAuthToken();
  if (!token) return; // anonymous users — skip

  navigator.sendBeacon
    ? navigator.sendBeacon(
        `${BASE_URL}/reading-history`,
        JSON.stringify(entry)
      )
    : fetch(`${BASE_URL}/reading-history`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(entry),
        keepalive: true,
      }).catch(() => {});
}

// ─── Auth / User API ──────────────────────────────────────────────────────────

export const authAPI = {
  me: () => apiFetch<UserProfile>('/auth/me'),
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptionAPI = {
  checkout: () =>
    apiFetch<{ checkout_url: string }>('/subscriptions/checkout', {
      method: 'POST',
    }),
};
