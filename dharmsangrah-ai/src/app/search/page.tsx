'use client';

// ─── Search Results Page ──────────────────────────────────────────────────────
// Real-time search with debounce, filter chips, verse result cards, empty state.

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { searchAPI } from '@/lib/api/client';
import { VerseCard } from '@/components/verse/VerseCard';
import { SearchBar } from '@/components/search/SearchBar';
import type { SearchResult, SearchFilters, SearchType } from '@/types';

// ─── Filter Definitions ───────────────────────────────────────────────────────

const CHAPTER_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 1);

const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  semantic: 'Semantic',
  exact: 'Exact match',
  commentator: 'Commentator',
};

const COMMENTATORS = ['Shankara', 'Ramanuja', 'Madhva', 'Tilak', 'Aurobindo', 'Gambhirananda'];

// ─── Debounce Hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const pathname      = usePathname();

  const [query, setQuery]           = useState(searchParams.get('q') ?? '');
  const [filters, setFilters]       = useState<Partial<SearchFilters>>({
    type: (searchParams.get('type') as SearchType) ?? 'semantic',
    chapter: searchParams.get('chapter') ? Number(searchParams.get('chapter')) : undefined,
    commentator: searchParams.get('commentator') ?? undefined,
  });
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 350);
  const abortRef = useRef<AbortController | null>(null);

  // Sync URL params
  const pushParams = useCallback(
    (q: string, f: Partial<SearchFilters>) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (f.type) params.set('type', f.type);
      if (f.chapter) params.set('chapter', String(f.chapter));
      if (f.commentator) params.set('commentator', f.commentator);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  // Run search
  const runSearch = useCallback(
    async (q: string, f: Partial<SearchFilters>) => {
      if (!q.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const res = await searchAPI.query(q, f);
        setResults(res.results);
        setTotal(res.total);
        setHasSearched(true);
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setError('Search failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Re-run on debounced query or filter change
  useEffect(() => {
    runSearch(debouncedQuery, filters);
    pushParams(debouncedQuery, filters);
  }, [debouncedQuery, filters, runSearch, pushParams]);

  function updateFilter(key: keyof SearchFilters, value: unknown) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilter(key: keyof SearchFilters) {
    setFilters((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
  }

  return (
    <div className="min-h-dvh pb-16">
      {/* ── Sticky search header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-parchment/95
                         backdrop-blur-sm safe-top">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={(q) => { setQuery(q); runSearch(q, filters); }}
            placeholder="Search verses, Sanskrit terms, themes…"
            autoFocus
          />
        </div>

        {/* Filter chips */}
        <div className="max-w-2xl mx-auto px-5 pb-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {/* Search type */}
            <div className="flex rounded-lg border border-border overflow-hidden text-ui-xs font-sans">
              {(Object.keys(SEARCH_TYPE_LABELS) as SearchType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => updateFilter('type', t)}
                  className={`px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                    filters.type === t
                      ? 'bg-navy text-white'
                      : 'text-charcoal-600 hover:bg-parchment-200'
                  }`}
                >
                  {SEARCH_TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Chapter filter */}
            <div className="relative">
              <select
                value={filters.chapter ?? ''}
                onChange={(e) =>
                  e.target.value
                    ? updateFilter('chapter', Number(e.target.value))
                    : clearFilter('chapter')
                }
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border
                           bg-white text-ui-xs font-sans text-charcoal cursor-pointer
                           focus:border-gold-400 focus:outline-none hover:border-border-strong
                           transition-colors"
                aria-label="Filter by chapter"
              >
                <option value="">All chapters</option>
                {CHAPTER_OPTIONS.map((n) => (
                  <option key={n} value={n}>Ch. {n}</option>
                ))}
              </select>
              <ChevronIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-400" />
            </div>

            {/* Commentator filter */}
            <div className="relative">
              <select
                value={filters.commentator ?? ''}
                onChange={(e) =>
                  e.target.value
                    ? updateFilter('commentator', e.target.value)
                    : clearFilter('commentator')
                }
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border
                           bg-white text-ui-xs font-sans text-charcoal cursor-pointer
                           focus:border-gold-400 focus:outline-none hover:border-border-strong
                           transition-colors"
                aria-label="Filter by commentator"
              >
                <option value="">All commentators</option>
                {COMMENTATORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-400" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 py-5 md:px-8">
        {/* Result count */}
        {hasSearched && !isLoading && (
          <p className="text-ui-sm font-sans text-charcoal-400 mb-4 animate-fade-in">
            {total} result{total !== 1 ? 's' : ''} for &ldquo;{debouncedQuery}&rdquo;
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <p className="text-error font-sans text-ui-base mb-3">{error}</p>
            <button
              onClick={() => runSearch(query, filters)}
              className="text-ui-sm text-gold-600 hover:text-gold-700 font-sans"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && results.length > 0 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {results.map((result) => (
              <SearchResultCard key={result.verse_ref} result={result} query={debouncedQuery} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState query={debouncedQuery} />
        )}

        {/* Pre-search prompt */}
        {!hasSearched && !isLoading && (
          <PreSearchPrompt onSuggestionClick={(q) => setQuery(q)} />
        )}
      </main>
    </div>
  );
}

// ─── Search Result Card ───────────────────────────────────────────────────────

function SearchResultCard({ result, query }: { result: SearchResult; query: string }) {
  // Highlight matching terms in the snippet
  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-gold-200 text-charcoal rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link
      href={`/verses/${encodeURIComponent(result.verse_ref.replace(' ', '_'))}`}
      className="group block rounded-card border border-border bg-white/70 p-4
                 hover:border-gold-300 hover:shadow-card-hover transition-all duration-200
                 hover:-translate-y-px"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-pill
                     bg-navy/5 border border-navy/10 text-navy
                     font-sans font-semibold text-ui-xs tracking-wide shrink-0"
        >
          {result.verse_ref}
        </span>
        {result.score !== undefined && (
          <span className="text-ui-xs font-sans text-charcoal-400">
            {Math.round(result.score * 100)}% match
          </span>
        )}
      </div>

      {/* Sanskrit snippet */}
      <p
        className="font-devanagari text-devanagari-sm text-charcoal-600 mb-2
                   line-clamp-1"
        lang="sa"
      >
        {result.sanskrit_devanagari}
      </p>

      {/* Depth layer 1 / highlight */}
      <p className="font-serif text-ui-base text-charcoal leading-relaxed line-clamp-2">
        {result.highlight
          ? highlightText(result.highlight)
          : result.depth_layers.layer_1}
      </p>

      {/* Arrow */}
      <div
        className="mt-2 text-ui-xs font-sans text-charcoal-400
                   group-hover:text-gold-600 transition-colors flex items-center gap-1"
      >
        Read verse →
      </div>
    </Link>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SearchResultSkeleton() {
  return (
    <div className="rounded-card border border-border bg-white/70 p-4">
      <div className="flex gap-3 mb-3">
        <div className="skeleton h-5 w-16 rounded-pill" />
      </div>
      <div className="skeleton h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton h-4 w-full mb-1 rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  const suggestions = [
    'karma yoga', 'self-realization', 'dharma', 'moksha', 'BG 2.47',
  ];
  const router = useRouter();

  return (
    <div className="text-center py-16 animate-fade-in">
      <p
        className="font-devanagari text-devanagari-xl text-gold-300 mb-4"
        lang="sa"
        aria-hidden="true"
      >
        ॐ
      </p>
      <h2 className="font-serif text-ui-xl text-navy mb-2">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-ui-sm text-charcoal-400 font-sans mb-6 max-w-sm mx-auto">
        Try different keywords, a verse reference like &ldquo;BG 2.47&rdquo;,
        or switch to semantic search.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
            className="citation-chip"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Pre-Search Prompt ────────────────────────────────────────────────────────

function PreSearchPrompt({ onSuggestionClick }: { onSuggestionClick: (q: string) => void }) {
  const trending = ['karma', 'dharma', 'yoga of action', 'renunciation', 'Arjuna', 'BG 6'];

  return (
    <div className="py-8 animate-fade-in">
      <p className="text-ui-sm font-sans text-charcoal-400 mb-3">Popular searches:</p>
      <div className="flex flex-wrap gap-2">
        {trending.map((t) => (
          <button
            key={t}
            onClick={() => onSuggestionClick(t)}
            className="citation-chip"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Chevron Icon ─────────────────────────────────────────────────────────────

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      aria-hidden="true" className={className}
    >
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
