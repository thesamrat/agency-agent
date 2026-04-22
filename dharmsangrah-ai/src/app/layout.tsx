import type { Metadata, Viewport } from 'next';
import { inter, crimsonPro } from '@/lib/fonts';
import { Providers } from './providers';
import { AppNav } from '@/components/nav/AppNav';
import './globals.css';

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    template: '%s | Dharmsangrah.ai',
    default: 'Dharmsangrah.ai — Bhagavad Gita with AI Wisdom',
  },
  description:
    'Explore the Bhagavad Gita through AI-powered insights, multi-tradition commentaries, and progressive depth layers. From casual seeker to serious scholar.',
  keywords: ['Bhagavad Gita', 'Sanskrit', 'Vedanta', 'AI', 'philosophy', 'spirituality'],
  authors: [{ name: 'Dharmsangrah.ai' }],
  openGraph: {
    type: 'website',
    siteName: 'Dharmsangrah.ai',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow user zoom — accessibility requirement
  themeColor: '#faf4e6',
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${crimsonPro.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preload self-hosted Devanagari subset */}
        <link
          rel="preload"
          href="/fonts/noto-sans-devanagari-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for any CDN assets */}
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="min-h-dvh bg-parchment text-charcoal antialiased">
        <Providers>
          <AppNav />
          <div className="pt-14">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
