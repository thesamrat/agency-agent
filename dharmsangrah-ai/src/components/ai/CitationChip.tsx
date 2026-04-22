'use client';

// ─── CitationChip ─────────────────────────────────────────────────────────────
// Inline citation that links to a verse page and shows a popover preview
// on hover (desktop) or tap (mobile).

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Citation } from '@/types';
import { verseAPI } from '@/lib/api/client';
import type { Verse } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CitationChipProps {
  citation: Citation;
}

// ─── Verse Preview Popover ────────────────────────────────────────────────────

interface VersePreviewPopoverProps {
  verseRef: string;
  onClose: () => void;
}

function VersePreviewPopover({ verseRef, onClose }: VersePreviewPopoverProps) {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    verseAPI
      .get(verseRef)
      .then((v) => { if (!cancelled) { setVerse(v); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [verseRef]);

  return (
    <div
      role="tooltip"
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                 w-72 rounded-card border border-border bg-white shadow-modal
                 p-4 text-left animate-fade-in"
    >
      {/* Notch */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2
                   w-3 h-3 bg-white border-r border-b border-border rotate-45"
        aria-hidden="true"
      />

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
      ) : verse ? (
        <>
          <span
            className="inline-flex px-2 py-0.5 rounded-pill mb-2
                       bg-navy/5 border border-navy/10 text-navy
                       font-sans font-semibold text-ui-xs tracking-wide"
          >
            {verse.verse_ref}
          </span>
          <p
            className="font-devanagari text-devanagari-sm text-charcoal-600 mb-2 line-clamp-2"
            lang="sa"
          >
            {verse.sanskrit_devanagari}
          </p>
          <p className="font-serif text-ui-sm text-charcoal leading-relaxed line-clamp-3">
            {verse.depth_layers.layer_1}
          </p>
          <Link
            href={`/verses/${encodeURIComponent(verseRef.replace(' ', '_'))}`}
            onClick={onClose}
            className="block mt-3 text-ui-xs font-sans font-medium text-gold-600
                       hover:text-gold-700 transition-colors"
          >
            Read full verse →
          </Link>
        </>
      ) : (
        <p className="text-ui-sm font-sans text-charcoal-400">Could not load preview.</p>
      )}
    </div>
  );
}

// ─── Citation Chip ────────────────────────────────────────────────────────────

export function CitationChip({ citation }: CitationChipProps) {
  const [showPopover, setShowPopover] = useState(false);
  const chipRef    = useRef<HTMLSpanElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout>>();

  // Desktop: show on hover with a short delay
  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setShowPopover(true), 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setShowPopover(false);
  }, []);

  // Mobile: toggle on tap
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // On touch devices, prevent the click from immediately following through
      // to the link — we show the popover first.
      const isTouch = window.matchMedia('(hover: none)').matches;
      if (isTouch) {
        e.preventDefault();
        setShowPopover((v) => !v);
      }
    },
    []
  );

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return;

    function handleOutside(e: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showPopover]);

  return (
    <span
      ref={chipRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={citation.link}
        onClick={handleClick}
        className="citation-chip"
        aria-label={`Citation: ${citation.verse_ref} (${citation.commentator}, ${citation.tradition})`}
      >
        {/* Book icon */}
        <BookIcon />
        <span className="font-semibold">{citation.verse_ref}</span>
        <span className="text-gold-500">·</span>
        <span>{citation.commentator}</span>
      </Link>

      {showPopover && (
        <VersePreviewPopover
          verseRef={citation.verse_ref}
          onClose={() => setShowPopover(false)}
        />
      )}
    </span>
  );
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function BookIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M1 2a1 1 0 011-1h2.5A1.5 1.5 0 016 2.5V9l-.5-.5A2 2 0 004 8H1V2z"
        stroke="currentColor" strokeWidth="1" fill="none"
      />
      <path
        d="M10 2a1 1 0 00-1-1H6.5A1.5 1.5 0 005 2.5V9l.5-.5A2 2 0 017 8h3V2z"
        stroke="currentColor" strokeWidth="1" fill="none"
      />
    </svg>
  );
}
