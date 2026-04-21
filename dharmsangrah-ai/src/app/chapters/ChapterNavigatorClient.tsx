'use client';

// ─── Chapter Navigator — Client Layer ─────────────────────────────────────────
// Grid of 18 chapter cards, progress rings, yoga type labels.
// Reading progress is hydrated from localStorage.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Chapter } from '@/types';

// ─── Yoga type → accent color ─────────────────────────────────────────────────

const YOGA_COLORS: Record<string, string> = {
  'Arjuna Vishada Yoga':              'bg-blue-50 text-blue-700 border-blue-200',
  'Sankhya Yoga':                     'bg-violet-50 text-violet-700 border-violet-200',
  'Karma Yoga':                       'bg-amber-50 text-amber-700 border-amber-200',
  'Jnana-Karma-Sanyasa Yoga':         'bg-teal-50 text-teal-700 border-teal-200',
  'Karma-Vairagya Yoga':              'bg-amber-50 text-amber-700 border-amber-200',
  'Abhyasa Yoga':                     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Paramahamsa Vijnana Yoga':         'bg-violet-50 text-violet-700 border-violet-200',
  'Aksara-Parabrahman Yoga':          'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Raja-Vidya-Raja-Guhya Yoga':       'bg-gold-50 text-gold-700 border-gold-200',
  'Vibhuti-Vistara-Yoga':             'bg-gold-50 text-gold-700 border-gold-200',
  'Vishvarupa-Sandarsana Yoga':       'bg-orange-50 text-orange-700 border-orange-200',
  'Bhakti Yoga':                      'bg-rose-50 text-rose-700 border-rose-200',
  'Kshetra-Kshetrajna Vibhaga Yoga':  'bg-teal-50 text-teal-700 border-teal-200',
  'Gunatraya-Vibhaga Yoga':           'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Purushottama Yoga':                'bg-gold-50 text-gold-700 border-gold-200',
  'Daivasura-Sampad-Vibhaga Yoga':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sraddhatraya-Vibhaga Yoga':        'bg-violet-50 text-violet-700 border-violet-200',
  'Moksha-Sanyasa Yoga':              'bg-blue-50 text-blue-700 border-blue-200',
};

// ─── Local progress store ─────────────────────────────────────────────────────

function loadProgress(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('ds-chapter-progress') ?? '{}');
  } catch {
    return {};
  }
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  read: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ read, total, size = 44, strokeWidth = 3 }: ProgressRingProps) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent     = total > 0 ? Math.min(read / total, 1) : 0;
  const offset      = circumference * (1 - percent);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0 -rotate-90"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      {/* Progress */}
      {read > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-gold-500 transition-all duration-700 ease-out"
          style={{
            '--circumference': circumference,
            '--offset': offset,
          } as React.CSSProperties}
        />
      )}
    </svg>
  );
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────

interface ChapterCardProps {
  chapter: Chapter;
  versesRead: number;
}

function ChapterCard({ chapter, versesRead }: ChapterCardProps) {
  const yogaColor  = YOGA_COLORS[chapter.yoga_type] ?? 'bg-parchment-200 text-charcoal-600 border-border';
  const isComplete = versesRead >= chapter.verse_count;

  return (
    <Link
      href={`/chapters/${chapter.number}`}
      className="group relative flex flex-col rounded-card border border-border bg-white/70
                 p-4 hover:border-gold-300 hover:shadow-card-hover transition-all duration-200
                 hover:-translate-y-px"
    >
      {/* Top row: number + progress ring */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center
                     font-serif font-bold text-ui-base transition-colors
                     ${isComplete
                       ? 'bg-gold-500 text-white'
                       : 'bg-navy/5 text-navy group-hover:bg-gold-50 group-hover:text-gold-600'
                     }`}
        >
          {chapter.number}
        </div>

        <div className="relative">
          <ProgressRing read={versesRead} total={chapter.verse_count} />
          {/* Verse count in center of ring */}
          <span
            className="absolute inset-0 flex items-center justify-center
                       text-ui-xs font-sans font-medium text-charcoal-400 rotate-90"
          >
            {versesRead > 0 ? versesRead : chapter.verse_count}
          </span>
        </div>
      </div>

      {/* Titles */}
      <h2 className="font-serif text-ui-base font-semibold text-navy leading-snug mb-0.5
                     group-hover:text-gold-600 transition-colors line-clamp-1">
        {chapter.title_english}
      </h2>
      <p
        className="font-devanagari text-devanagari-sm text-charcoal-400 mb-2 line-clamp-1"
        lang="sa"
      >
        {chapter.title_sanskrit}
      </p>

      {/* Yoga type badge */}
      <span
        className={`self-start inline-flex items-center px-2 py-0.5 rounded-pill
                   border text-ui-xs font-sans mb-3 line-clamp-1 ${yogaColor}`}
      >
        {chapter.yoga_type}
      </span>

      {/* Summary */}
      <p className="text-ui-sm text-charcoal-600 leading-relaxed line-clamp-2 flex-1">
        {chapter.summary}
      </p>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
        <span className="text-ui-xs font-sans text-charcoal-400">
          {chapter.verse_count} verses
        </span>
        {versesRead > 0 && !isComplete && (
          <span className="text-ui-xs font-sans text-gold-600 font-medium">
            {versesRead}/{chapter.verse_count} read
          </span>
        )}
        {isComplete && (
          <span className="text-ui-xs font-sans text-gold-600 font-semibold flex items-center gap-1">
            <CheckIcon /> Complete
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ChapterNavigatorClientProps {
  chapters: Chapter[];
}

export function ChapterNavigatorClient({ chapters }: ChapterNavigatorClientProps) {
  const [progress, setProgress] = useState<Record<number, number>>({});

  // Hydrate progress from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const totalVerses    = chapters.reduce((acc, c) => acc + c.verse_count, 0);
  const totalRead      = Object.values(progress).reduce((a, b) => a + b, 0);
  const overallPercent = totalVerses > 0 ? Math.round((totalRead / totalVerses) * 100) : 0;

  return (
    <div className="min-h-dvh pb-16">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="px-5 pt-10 pb-8 text-center md:px-8">
        <p className="font-devanagari text-devanagari-base text-gold-500 mb-2" lang="sa">
          अथ अष्टादशोऽध्यायाः
        </p>
        <h1 className="font-serif text-ui-2xl text-navy mb-2">
          18 Chapters of the Gita
        </h1>
        <p className="text-ui-sm text-charcoal-400 font-sans">
          {totalRead} of {totalVerses} verses explored
        </p>

        {/* Overall progress bar */}
        <div className="max-w-xs mx-auto mt-4">
          <div className="usage-bar-track">
            <div
              className="usage-bar-fill bg-gradient-to-r from-gold-400 to-saffron-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-ui-xs text-charcoal-400 font-sans text-right mt-1">
            {overallPercent}% complete
          </p>
        </div>
      </header>

      {/* ── Chapter Grid ──────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-5 md:px-8">
        {/*
          Mobile:  1 column
          Tablet:  2 columns
          Desktop: 3 columns
        */}
        <div
          className="grid gap-4
                     grid-cols-1
                     sm:grid-cols-2
                     lg:grid-cols-3"
          role="list"
          aria-label="Bhagavad Gita chapters"
        >
          {chapters.map((chapter) => (
            <div key={chapter.number} role="listitem">
              <ChapterCard
                chapter={chapter}
                versesRead={progress[chapter.number] ?? 0}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Check Icon ───────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
