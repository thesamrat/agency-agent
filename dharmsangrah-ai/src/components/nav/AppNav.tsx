'use client';

// ─── AppNav ───────────────────────────────────────────────────────────────────
// Sticky top navigation bar — mobile-first.
// Mobile: logo + search icon + ask icon + profile
// Desktop: logo + nav links + search bar + profile

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

// ─── Nav Links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/chapters', label: 'Chapters' },
  { href: '/search',   label: 'Search' },
  { href: '/ask',      label: 'Ask AI' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppNav() {
  const pathname       = usePathname();
  const { profile }    = useUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 inset-x-0 z-30 h-14 border-b border-border
                 bg-parchment/95 backdrop-blur-sm safe-top"
    >
      <div className="max-w-5xl mx-auto h-full px-5 flex items-center gap-4 md:px-8">

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Dharmsangrah.ai — Home"
        >
          {/* Devanagari initial mark */}
          <span
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-saffron-500
                       flex items-center justify-center text-white font-devanagari
                       text-devanagari-sm font-bold leading-none"
            aria-hidden="true"
          >
            ध
          </span>
          <span className="font-serif text-ui-lg font-semibold text-navy hidden sm:block">
            Dharmsangrah
          </span>
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1 ml-4"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg font-sans text-ui-sm font-medium
                           transition-colors duration-150
                           ${active
                             ? 'bg-gold-50 text-gold-700'
                             : 'text-charcoal-600 hover:text-charcoal hover:bg-parchment-200'
                           }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Ask AI button (desktop) ───────────────────────────────────── */}
        <Link
          href="/ask"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-pill
                     bg-saffron text-white font-sans text-ui-sm font-medium
                     hover:bg-saffron-600 transition-colors"
        >
          <AskIcon />
          Ask AI
        </Link>

        {/* ── Mobile icons ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/search"
            aria-label="Search"
            className="w-9 h-9 rounded-lg flex items-center justify-center
                       text-charcoal-400 hover:text-charcoal hover:bg-parchment-200
                       transition-colors"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/ask"
            aria-label="Ask AI"
            className="w-9 h-9 rounded-lg flex items-center justify-center
                       text-saffron hover:text-saffron-600 transition-colors"
          >
            <AskIcon />
          </Link>
        </div>

        {/* ── Profile / auth ────────────────────────────────────────────── */}
        {profile ? (
          <Link
            href="/profile"
            aria-label={`Profile: ${profile.display_name ?? profile.email}`}
            className="shrink-0 w-8 h-8 rounded-full overflow-hidden
                       border-2 border-border hover:border-gold-300 transition-colors"
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-navy/10 flex items-center justify-center
                           font-serif font-bold text-navy text-ui-xs"
              >
                {(profile.display_name ?? profile.email).charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="font-sans text-ui-sm font-medium text-charcoal-600
                       hover:text-charcoal transition-colors hidden sm:block"
          >
            Sign in
          </Link>
        )}
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      {/* Separate sticky bottom bar for primary mobile navigation            */}
    </header>
  );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────
// Exported separately for placement at the bottom of mobile viewports.

export function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/',         label: 'Home',     icon: HomeIcon },
    { href: '/chapters', label: 'Chapters', icon: BookIcon },
    { href: '/ask',      label: 'Ask',      icon: AskIcon  },
    { href: '/search',   label: 'Search',   icon: SearchIcon },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 md:hidden safe-bottom
                 border-t border-border bg-parchment/95 backdrop-blur-sm"
    >
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center
                         py-2 gap-0.5 transition-colors
                         ${active ? 'text-gold-600' : 'text-charcoal-400'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              <span className="text-ui-xs font-sans">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 3h5.5A2.5 2.5 0 0112 5.5V17l-1-1a3 3 0 00-3 0l-1 1V5a2 2 0 00-2-2H4z"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M16 3h-4.5A2.5 2.5 0 009 5.5V17l1-1a3 3 0 013 0l1 1V5a2 2 0 012-2h0"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2C5.58 2 2 5.36 2 9.5c0 1.8.65 3.45 1.72 4.75L3 17l2.9-.68A8.04 8.04 0 0010 17c4.42 0 8-3.36 8-7.5S14.42 2 10 2z"
            stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M10 6v4M10 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
