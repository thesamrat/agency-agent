import type { Metadata } from 'next';
import { chapterAPI } from '@/lib/api/client';
import { ChapterNavigatorClient } from './ChapterNavigatorClient';

export const metadata: Metadata = {
  title: 'All 18 Chapters | Dharmsangrah.ai',
  description:
    'Navigate all 18 chapters of the Bhagavad Gita with yoga type labels, verse counts, and your reading progress.',
};

export default async function ChaptersPage() {
  const chapters = await chapterAPI.list();

  return <ChapterNavigatorClient chapters={chapters} />;
}
