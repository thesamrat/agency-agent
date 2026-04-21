// ─── Font Strategy ────────────────────────────────────────────────────────────
//
// Sanskrit/Devanagari support requires careful font selection:
//
// 1. Noto Sans Devanagari  — Google Fonts, comprehensive Unicode coverage,
//    variable-weight axis, subset to only Devanagari block (U+0900–U+097F)
//    to avoid 200 kB+ full font download.
//
// 2. Crimson Pro           — Elegant serif for English body text and
//    depth-layer prose. Pairs beautifully with Devanagari at display sizes.
//
// 3. Inter                 — UI chrome: nav, buttons, metadata labels.
//    System-font fallback stack ensures zero FOUT risk.
//
// Loading strategy:
//  - `display: swap` on all fonts — text visible immediately in fallback.
//  - Preload <link> tags injected in layout.tsx for Noto Sans Devanagari
//    subset (only the glyphs used in verse display) and Crimson Pro.
//  - Self-hosted woff2 subset of Noto Sans Devanagari (via `pyftsubset`
//    in the build pipeline) lives in /public/fonts/ — avoids third-party
//    DNS resolution cost and lets us set aggressive Cache-Control headers.
//  - Inter loaded from next/font/google with `preload: true` — generates
//    optimal <link rel="preload"> automatically.

import { Inter, Crimson_Pro } from 'next/font/google';

// Inter: UI shell — nav, buttons, labels, metadata
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
});

// Crimson Pro: Body reading text, depth layers, commentary prose
export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

// Noto Sans Devanagari is self-hosted (see /public/fonts/)
// because next/font doesn't support subsetting the Devanagari range
// granularly enough to keep the bundle under 60 kB.
// The @font-face declaration is in globals.css.
export const DEVANAGARI_FONT_CSS_VAR = '--font-devanagari';

// CSS class to apply Noto Sans Devanagari
export const DEVANAGARI_CLASS = 'font-devanagari';
