'use client';

// ─── VerseCard ────────────────────────────────────────────────────────────────
// Compact verse preview for lists, search results, and featured slots.
// Variants: 'compact' (default) | 'featured' (verse of day)

import Link from 'next/link';
import type { Verse, VersePreview, SearchResult } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type VerseCardData = Pick<
  Verse,
  | 'verse_ref'
  | 'chapter_number'
  | 'verse_number'
  | 'sanskrit_devanagari'
  | 'depth_layers'
>;

interface VerseCardProps {
  verse: VerseCardData | SearchResult;
  variant?: 'compact' | 'featured';
  highlight?: string; // matched text to mark up
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VerseCard({ verse, variant = 'compact', highlight }: VerseCardProps) {
  const href = `/verses/${encodeURIComponent(verse.verse_ref.replace(' ', '_'))}`;

  const essence = verse.depth_layers.layer_1;

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className="group block rounded-card border border-gold-200 bg-gradient-to-br
                   from-parchment-100 to-white p-6 shadow-card
                   hover:shadow-card-hover hover:border-gold-300 transition-all duration-200"
      >
        {/* Verse ref */}
        <span
          className="inline-flex items-center px-3 py-1 rounded-pill mb-4
                     bg-navy/5 border border-navy/10 text-navy
                     font-sans font-semibold text-ui-xs tracking-wide"
        >
          {verse.verse_ref}
        </span>

        {/* Sanskrit */}
        <p
          className="font-devanagari text-devanagari-base text-charcoal leading-[2] mb-3"
          lang="sa"
          dir="ltr"
        >
          {verse.sanskrit_devanagari}
        </p>

        {/* Divider */}
        <div className="divider-gold w-12 my-4 mx-0" />

        {/* Essence */}
        <p className="font-serif text-ui-lg text-charcoal-800 leading-relaxed">
          {highlight ? <HighlightedText text={essence} query={highlight} /> : essence}
        </p>

        {/* Read CTA */}
        <p
          className="mt-4 text-ui-sm font-sans text-charcoal-400
                     group-hover:text-gold-600 transition-colors"
        >
          Read full verse →
        </p>
      </Link>
    );
  }

  // Compact variant
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-border bg-white/70 px-4 py-3.5
                 hover:border-gold-300 hover:shadow-card transition-all duration-150
                 hover:-translate-y-px"
    >
      <div className="flex items-start gap-3">
        {/* Chapter number indicator */}
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-navy/5 border border-navy/10
                     flex items-center justify-center font-serif font-semibold
                     text-ui-xs text-navy group-hover:bg-gold-50
                     group-hover:border-gold-200 group-hover:text-gold-600
                     transition-colors"
        >
          {verse.chapter_number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-sans font-semibold text-ui-xs text-charcoal-400 tracking-wide">
              {verse.verse_ref}
            </span>
          </div>

          {/* Sanskrit — abbreviated */}
          <p
            className="font-devanagari text-devanagari-sm text-charcoal-600 leading-relaxed
                       line-clamp-1 mb-1"
            lang="sa"
          >
            {verse.sanskrit_devanagari}
          </p>

          {/* Layer 1 essence */}
          <p className="font-serif text-ui-base text-charcoal leading-snug line-clamp-2">
            {highlight ? <HighlightedText text={essence} query={highlight} /> : essence}
          </p>
        </div>

        <div className="shrink-0 text-charcoal-300 group-hover:text-gold-400 transition-colors">
          <ChevronRightIcon />
        </div>
      </div>
    </Link>
  );
}

// ─── Highlighted Text ─────────────────────────────────────────────────────────

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex   = new RegExp(`(${escaped})`, 'gi');
  const parts   = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-gold-200 text-charcoal rounded-sm px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function VerseCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-white/70 p-6">
      <div className="skeleton h-5 w-16 rounded-pill mb-4" />
      <div className="skeleton h-7 w-full rounded mb-2" />
      <div className="skeleton h-7 w-3/4 rounded mb-4" />
      <div className="divider-gold w-12 my-4 mx-0 opacity-30" />
      <div className="skeleton h-5 w-full rounded mb-2" />
      <div className="skeleton h-5 w-2/3 rounded" />
    </div>
  );
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
