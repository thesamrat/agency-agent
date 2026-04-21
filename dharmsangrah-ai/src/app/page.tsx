'use client';

// ─── Home / Landing Screen ────────────────────────────────────────────────────
// Mobile-first hero → verse of the day → quick search → AI Q&A CTA

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VerseCard } from '@/components/verse/VerseCard';
import { SearchBar } from '@/components/search/SearchBar';
import { UsageMeter } from '@/components/ai/UsageMeter';
import { useVerseOfDay } from '@/hooks/useVerseOfDay';
import { useUserProfile } from '@/hooks/useUserProfile';
import { VerseCardSkeleton } from '@/components/verse/VerseCard';

// ─── Suggested Questions ─────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'What does Krishna say about duty when it conflicts with love?',
  'How do I find peace when my mind won\'t stop?',
  'What is the difference between Karma and Bhakti Yoga?',
  'How did Shankara interpret the Atman in the Gita?',
];

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative px-5 pt-16 pb-12 text-center overflow-hidden md:pt-24 md:pb-16">
      {/* Subtle mandala watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
      >
        <svg viewBox="0 0 400 400" className="w-[600px] h-[600px]" fill="currentColor">
          <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="0.5" fill="none" />
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="200" y1="20"
              x2="200" y2="380"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 22.5} 200 200)`}
            />
          ))}
        </svg>
      </div>

      {/* Sanskrit epigraph */}
      <p
        className="font-devanagari text-devanagari-sm text-gold-600 mb-4 animate-fade-in"
        lang="sa"
      >
        श्रीमद्भगवद्गीता
      </p>

      <h1 className="font-serif text-ui-3xl text-navy leading-tight mb-4 text-balance animate-fade-in md:text-ui-4xl">
        Ancient wisdom,<br />
        <span className="text-gradient-gold">illuminated for today</span>
      </h1>

      <p className="text-ui-lg text-charcoal-600 max-w-md mx-auto mb-8 leading-relaxed animate-fade-in">
        Explore the Bhagavad Gita through AI insights, multi-tradition
        commentaries, and depth layers built for curious minds.
      </p>

      <div className="flex flex-col gap-3 items-center sm:flex-row sm:justify-center">
        <Link
          href="/ask"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-pill
                     bg-saffron text-white font-sans font-medium text-ui-base
                     shadow-md hover:bg-saffron-600 active:scale-[0.98]
                     transition-all duration-150 will-change-transform"
        >
          <AskIcon />
          Ask the Gita a question
        </Link>
        <Link
          href="/chapters"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-pill
                     border border-border bg-white/60 text-charcoal font-sans
                     font-medium text-ui-base hover:bg-white hover:border-border-strong
                     transition-all duration-150"
        >
          Browse all 18 chapters
        </Link>
      </div>
    </section>
  );
}

// ─── Verse of the Day ─────────────────────────────────────────────────────────

function VerseOfDay() {
  const { verse, isLoading } = useVerseOfDay();

  return (
    <section className="px-5 pb-10 md:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <span className="depth-label">
            <SparkleIcon />
            Verse of the day
          </span>
          <Link
            href="/chapters"
            className="text-ui-sm text-gold-600 hover:text-gold-700 font-sans font-medium"
          >
            Browse all →
          </Link>
        </header>

        {isLoading ? (
          <VerseCardSkeleton />
        ) : verse ? (
          <VerseCard verse={verse} variant="featured" />
        ) : null}
      </div>
    </section>
  );
}

// ─── Quick Search ─────────────────────────────────────────────────────────────

function QuickSearch() {
  const router = useRouter();

  function handleSearch(query: string) {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="px-5 pb-10 md:px-8">
      <div className="max-w-2xl mx-auto">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search verses, themes, Sanskrit words…"
          autoFocus={false}
        />
      </div>
    </section>
  );
}

// ─── AI Q&A Teaser ───────────────────────────────────────────────────────────

function AskTeaser() {
  const { profile } = useUserProfile();
  const router = useRouter();

  return (
    <section className="px-5 pb-12 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-card border border-gold-200 bg-gradient-to-br
                     from-parchment-100 to-white p-6 shadow-card"
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="shrink-0 w-10 h-10 rounded-full bg-gold-100
                         flex items-center justify-center text-gold-600"
            >
              <AskIcon size={18} />
            </div>
            <div>
              <h2 className="font-serif text-ui-xl text-navy leading-snug mb-1">
                Ask anything about the Gita
              </h2>
              <p className="text-ui-sm text-charcoal-400">
                AI-powered answers drawing on Shankara, Ramanuja, Madhva &amp; more.
              </p>
            </div>
          </div>

          {/* Suggested questions */}
          <div className="flex flex-col gap-2 mb-5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() =>
                  router.push(`/ask?q=${encodeURIComponent(q)}`)
                }
                className="text-left px-4 py-2.5 rounded-lg border border-border
                           bg-white/80 text-ui-sm text-charcoal hover:border-gold-300
                           hover:bg-gold-50 transition-colors duration-150"
              >
                <span className="text-gold-500 mr-1.5">›</span>
                {q}
              </button>
            ))}
          </div>

          {/* Usage meter for signed-in users */}
          {profile && (
            <div className="mb-4">
              <UsageMeter
                used={profile.subscription.queries_used}
                limit={profile.subscription.queries_limit}
                tier={profile.subscription.tier}
                compact
              />
            </div>
          )}

          <Link
            href="/ask"
            className="block w-full text-center py-3 rounded-pill
                       bg-saffron text-white font-sans font-medium text-ui-base
                       hover:bg-saffron-600 transition-colors duration-150"
          >
            Start asking
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Chapter Previews Row ─────────────────────────────────────────────────────

function ChapterRow() {
  const highlights = [1, 2, 6, 12, 18]; // curated highlight chapters

  return (
    <section className="px-5 pb-16 md:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <span className="depth-label">Popular chapters</span>
          <Link href="/chapters" className="text-ui-sm text-gold-600 hover:text-gold-700 font-sans font-medium">
            All 18 →
          </Link>
        </header>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {highlights.map((n) => (
            <Link
              key={n}
              href={`/chapters/${n}`}
              className="snap-start shrink-0 flex flex-col items-center justify-center
                         w-20 h-20 rounded-card border border-border bg-white/60
                         hover:border-gold-300 hover:bg-gold-50 transition-colors
                         gap-1 group"
            >
              <span className="font-serif text-ui-xl font-semibold text-navy
                               group-hover:text-gold-600 transition-colors">
                {n}
              </span>
              <span className="text-ui-xs text-charcoal-400 font-sans">Ch. {n}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <div className="divider-gold" />
      <VerseOfDay />
      <QuickSearch />
      <AskTeaser />
      <ChapterRow />
    </main>
  );
}

// ─── Micro Icons ──────────────────────────────────────────────────────────────

function AskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2C5.58 2 2 5.36 2 9.5c0 1.8.65 3.45 1.72 4.75L3 17l2.9-.68A8.04 8.04 0 0010 17c4.42 0 8-3.36 8-7.5S14.42 2 10 2z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 6v4M10 12.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1l1.3 4H13l-3.5 2.5L10.8 12 7 9.5 3.2 12l1.3-4.5L1 5h4.7L7 1z"
        fill="currentColor"
      />
    </svg>
  );
}
