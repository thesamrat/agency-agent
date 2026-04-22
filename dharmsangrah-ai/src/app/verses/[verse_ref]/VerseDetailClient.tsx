'use client';

// ─── Verse Detail — Client Interactive Layer ──────────────────────────────────
// Handles: Sanskrit script toggle, depth accordion, share modal,
//          reading history tracking on mount.

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Verse } from '@/types';
import { trackReading } from '@/lib/api/client';
import { DepthLayerAccordion } from '@/components/verse/DepthLayerAccordion';
import { ShareModal } from '@/components/share/ShareModal';
import { CommentaryCard } from '@/components/verse/CommentaryCard';
import { CitationChip } from '@/components/ai/CitationChip';

// ─── Props ────────────────────────────────────────────────────────────────────

interface VerseDetailClientProps {
  verse: Verse;
}

// ─── Script Toggle ─────────────────────────────────────────────────────────

type ScriptMode = 'devanagari' | 'iast' | 'both';

// ─── Component ───────────────────────────────────────────────────────────────

export function VerseDetailClient({ verse }: VerseDetailClientProps) {
  const [scriptMode, setScriptMode] = useState<ScriptMode>('devanagari');
  const [showShare, setShowShare] = useState(false);
  const [deepestLayerSeen, setDeepestLayerSeen] = useState<1 | 2 | 3 | 4>(1);

  // Track reading history on mount (fire-and-forget)
  useEffect(() => {
    trackReading({
      verse_ref: verse.verse_ref,
      viewed_at: new Date().toISOString(),
      depth_reached: 1,
    });
  }, [verse.verse_ref]);

  // Update tracking when user digs deeper
  const handleDepthExpand = useCallback(
    (layer: 1 | 2 | 3 | 4) => {
      if (layer > deepestLayerSeen) {
        setDeepestLayerSeen(layer);
        trackReading({
          verse_ref: verse.verse_ref,
          viewed_at: new Date().toISOString(),
          depth_reached: layer,
        });
      }
    },
    [verse.verse_ref, deepestLayerSeen]
  );

  const chapterNum = verse.chapter_number;
  const verseNum   = verse.verse_number;

  return (
    <>
      {/* Page shell */}
      <article className="min-h-dvh pb-24">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="px-5 pt-5 pb-2 flex items-center gap-2 text-ui-sm text-charcoal-400 font-sans"
        >
          <Link href="/chapters" className="hover:text-gold-600 transition-colors">
            Chapters
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/chapters/${chapterNum}`}
            className="hover:text-gold-600 transition-colors"
          >
            Chapter {chapterNum}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-charcoal-600" aria-current="page">
            Verse {verseNum}
          </span>
        </nav>

        {/* ── Sanskrit Display Block ─────────────────────────────────────── */}
        <header className="px-5 pt-4 pb-6 border-b border-border md:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Verse ref badge */}
            <div className="flex items-center justify-between mb-5">
              <span
                className="inline-flex items-center px-3 py-1 rounded-pill
                           bg-navy/5 border border-navy/10 text-navy
                           font-sans font-semibold text-ui-sm tracking-wide"
              >
                {verse.verse_ref}
              </span>

              {/* Script toggle */}
              <div
                role="group"
                aria-label="Script display mode"
                className="flex rounded-lg border border-border overflow-hidden text-ui-sm font-sans"
              >
                {(['devanagari', 'iast', 'both'] as ScriptMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setScriptMode(mode)}
                    aria-pressed={scriptMode === mode}
                    className={`px-3 py-1.5 capitalize transition-colors ${
                      scriptMode === mode
                        ? 'bg-navy text-white'
                        : 'text-charcoal-600 hover:bg-parchment-200'
                    }`}
                  >
                    {mode === 'devanagari' ? 'देव' : mode === 'iast' ? 'IAST' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sanskrit text */}
            <div className="space-y-3">
              {(scriptMode === 'devanagari' || scriptMode === 'both') && (
                <p
                  className="font-devanagari text-devanagari-lg text-charcoal leading-[2]"
                  lang="sa"
                  dir="ltr"
                >
                  {verse.sanskrit_devanagari}
                </p>
              )}

              {(scriptMode === 'iast' || scriptMode === 'both') && (
                <p
                  className="font-iast text-ui-xl text-charcoal-600 leading-loose"
                  lang="sa-Latn"
                >
                  {verse.sanskrit_iast}
                </p>
              )}
            </div>

            {/* Quick translation */}
            {verse.translations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-light">
                <p className="text-ui-sm text-charcoal-400 font-sans mb-1">
                  Translation · {verse.translations[0].commentator}
                </p>
                <p className="font-serif text-ui-lg text-charcoal leading-relaxed">
                  &ldquo;{verse.translations[0].text}&rdquo;
                </p>
              </div>
            )}
          </div>
        </header>

        {/* ── Depth Layers ───────────────────────────────────────────────── */}
        <section className="px-5 py-6 md:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-sans text-ui-sm font-semibold uppercase tracking-wider
                           text-charcoal-400 mb-4">
              Depth Layers
            </h2>
            <DepthLayerAccordion
              layers={verse.depth_layers}
              onLayerExpand={handleDepthExpand}
            />
          </div>
        </section>

        {/* ── Commentaries ───────────────────────────────────────────────── */}
        {verse.commentaries.length > 0 && (
          <section className="px-5 pb-6 md:px-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-sans text-ui-sm font-semibold uppercase tracking-wider
                             text-charcoal-400 mb-4">
                Traditional Commentaries
              </h2>
              <div className="flex flex-col gap-4">
                {verse.commentaries.map((commentary) => (
                  <CommentaryCard
                    key={commentary.commentator.name}
                    commentary={commentary}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Related / AI ───────────────────────────────────────────────── */}
        <section className="px-5 pb-6 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-card border border-gold-200 bg-gold-50/50
                         p-4 flex items-center gap-3"
            >
              <div className="text-gold-500">
                <SparkleIcon />
              </div>
              <p className="text-ui-sm text-charcoal-600 flex-1">
                Want a deeper explanation of this verse?
              </p>
              <Link
                href={`/ask?verse=${encodeURIComponent(verse.verse_ref)}`}
                className="shrink-0 px-4 py-2 rounded-pill bg-saffron text-white
                           font-sans text-ui-sm font-medium hover:bg-saffron-600
                           transition-colors"
              >
                Ask AI
              </Link>
            </div>
          </div>
        </section>

        {/* ── Chapter Navigation ─────────────────────────────────────────── */}
        <nav
          aria-label="Verse navigation"
          className="px-5 pb-6 md:px-8"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            {verseNum > 1 && (
              <Link
                href={`/verses/${encodeURIComponent(`BG ${chapterNum}.${verseNum - 1}`)}`}
                className="flex items-center gap-2 text-ui-sm font-sans text-charcoal-400
                           hover:text-gold-600 transition-colors"
              >
                ← BG {chapterNum}.{verseNum - 1}
              </Link>
            )}
            <div className="flex-1" />
            <Link
              href={`/verses/${encodeURIComponent(`BG ${chapterNum}.${verseNum + 1}`)}`}
              className="flex items-center gap-2 text-ui-sm font-sans text-charcoal-400
                         hover:text-gold-600 transition-colors"
            >
              BG {chapterNum}.{verseNum + 1} →
            </Link>
          </div>
        </nav>
      </article>

      {/* ── Floating Action Bar (mobile) ────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 safe-bottom border-t border-border
                   bg-parchment/95 backdrop-blur-sm px-5 py-3"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setShowShare(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-pill
                       border border-border bg-white text-charcoal font-sans font-medium
                       text-ui-sm hover:border-gold-300 hover:bg-gold-50 transition-colors"
          >
            <ShareIcon />
            Share
          </button>
          <Link
            href={`/ask?verse=${encodeURIComponent(verse.verse_ref)}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-pill
                       bg-saffron text-white font-sans font-medium text-ui-sm
                       hover:bg-saffron-600 transition-colors"
          >
            <AskIcon />
            Ask AI
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          verseRef={verse.verse_ref}
          defaultText={verse.depth_layers.layer_1}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12 10.6a2 2 0 00-1.6.8L6.2 9a2 2 0 000-2L10.4 4.6a2 2 0 10-.7-1.1L5.6 5.9a2 2 0 100 4.2l4.1 2.4a2 2 0 101.3-1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function AskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5C4.41 1.5 1.5 4.19 1.5 7.5c0 1.4.5 2.69 1.34 3.7L2.25 13.5l2.3-.54A6.5 6.5 0 008 13.5c3.59 0 6.5-2.69 6.5-6S11.59 1.5 8 1.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 2l1.5 4.5H15l-3.75 2.75 1.5 4.75L9 11.25 5.25 14l1.5-4.75L3 6.5h4.5L9 2z"
        fill="currentColor"
      />
    </svg>
  );
}
