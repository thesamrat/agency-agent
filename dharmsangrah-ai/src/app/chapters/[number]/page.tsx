import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { chapterAPI, verseAPI } from '@/lib/api/client';
import { VerseCard } from '@/components/verse/VerseCard';

interface Props {
  params: { number: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const num = parseInt(params.number, 10);
  if (isNaN(num) || num < 1 || num > 18) return {};
  const chapter = await chapterAPI.get(num).catch(() => null);
  if (!chapter) return {};
  return {
    title: `Chapter ${num}: ${chapter.title_english} | Dharmsangrah.ai`,
    description: chapter.summary,
  };
}

export default async function ChapterPage({ params }: Props) {
  const num = parseInt(params.number, 10);
  if (isNaN(num) || num < 1 || num > 18) notFound();

  const [chapter, versesPage] = await Promise.all([
    chapterAPI.get(num).catch(() => null),
    verseAPI.listByChapter(num, 1, 78).catch(() => null),
  ]);

  if (!chapter) notFound();

  const verses = versesPage?.data ?? [];

  return (
    <main className="min-h-dvh pb-24">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="px-5 pt-5 pb-2 flex items-center gap-2 text-ui-sm text-charcoal-400 font-sans">
        <Link href="/chapters" className="hover:text-gold-600 transition-colors">Chapters</Link>
        <span aria-hidden="true">›</span>
        <span className="text-charcoal-600" aria-current="page">Chapter {num}</span>
      </nav>

      {/* Header */}
      <header className="px-5 pt-4 pb-8 border-b border-border md:px-8">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-ui-sm text-gold-600 font-medium uppercase tracking-widest mb-2">
            {chapter.yoga_type}
          </p>
          <h1 className="font-serif text-3xl text-navy font-bold leading-snug mb-3">
            Chapter {num}: {chapter.title_english}
          </h1>
          <p className="font-devanagari text-devanagari-sm text-charcoal-500 mb-4" lang="sa">
            {chapter.title_sanskrit}
          </p>
          <p className="font-sans text-ui-base text-charcoal-600 leading-relaxed max-w-prose">
            {chapter.summary}
          </p>
          <p className="mt-3 text-ui-sm text-charcoal-400 font-sans">
            {chapter.verse_count} verses
          </p>
        </div>
      </header>

      {/* Verse list */}
      <section aria-label="Verses" className="px-5 pt-6 md:px-8">
        <div className="max-w-2xl mx-auto space-y-3">
          {verses.length === 0 ? (
            <p className="text-charcoal-400 font-sans text-ui-sm py-8 text-center">
              Verses are being loaded. Check back shortly.
            </p>
          ) : (
            verses.map((verse) => (
              <VerseCard key={verse.verse_ref} verse={verse} />
            ))
          )}
        </div>
      </section>

      {/* Chapter navigation */}
      <nav aria-label="Chapter navigation" className="px-5 pt-10 pb-4 md:px-8">
        <div className="max-w-2xl mx-auto flex justify-between">
          {num > 1 ? (
            <Link
              href={`/chapters/${num - 1}`}
              className="flex items-center gap-2 text-ui-sm font-sans text-charcoal-400 hover:text-navy transition-colors"
            >
              ← Chapter {num - 1}
            </Link>
          ) : <span />}
          {num < 18 ? (
            <Link
              href={`/chapters/${num + 1}`}
              className="flex items-center gap-2 text-ui-sm font-sans text-charcoal-400 hover:text-navy transition-colors"
            >
              Chapter {num + 1} →
            </Link>
          ) : <span />}
        </div>
      </nav>
    </main>
  );
}
