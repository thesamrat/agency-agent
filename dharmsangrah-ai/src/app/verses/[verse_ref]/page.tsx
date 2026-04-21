import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { verseAPI } from '@/lib/api/client';
import { VerseDetailClient } from './VerseDetailClient';
import type { Verse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { verse_ref: string };
}

// ─── Metadata (server-side, SEO) ──────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const verse = await verseAPI.get(decodeURIComponent(params.verse_ref));
    return {
      title: `${verse.verse_ref} — ${verse.depth_layers.layer_1}`,
      description: verse.depth_layers.layer_2.slice(0, 160),
      openGraph: {
        title: `${verse.verse_ref} | Dharmsangrah.ai`,
        description: verse.depth_layers.layer_1,
        images: [
          {
            url: `/api/og?verse_ref=${encodeURIComponent(verse.verse_ref)}`,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  } catch {
    return { title: 'Verse Not Found | Dharmsangrah.ai' };
  }
}

// ─── Server Component Shell ───────────────────────────────────────────────────
// Fetches verse data server-side for fast initial paint, hands off to client
// component for interactivity (depth accordion, share modal, reading tracking).

export default async function VerseDetailPage({ params }: PageProps) {
  let verse: Verse;

  try {
    verse = await verseAPI.get(decodeURIComponent(params.verse_ref));
  } catch {
    notFound();
  }

  return <VerseDetailClient verse={verse} />;
}
