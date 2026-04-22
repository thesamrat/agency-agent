'use client';

// ─── UpgradeBanner ────────────────────────────────────────────────────────────
// Non-intrusive banner shown when free-tier limit is reached.
// Does NOT block the UI — it sits inline above the input area.

import { useState } from 'react';
import Link from 'next/link';

interface UpgradeBannerProps {
  queriesUsed: number;
  queriesLimit: number;
}

export function UpgradeBanner({ queriesUsed, queriesLimit }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="rounded-card border border-gold-200 bg-gradient-to-br
                 from-gold-50 to-parchment-100 p-4 animate-slide-up"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="shrink-0 w-9 h-9 rounded-full bg-gold-100 flex items-center
                     justify-center text-gold-600"
        >
          <LockIcon />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-ui-sm text-navy mb-0.5">
            Monthly limit reached ({queriesUsed}/{queriesLimit} queries)
          </p>
          <p className="font-sans text-ui-xs text-charcoal-400 leading-relaxed">
            Upgrade to Scholar for unlimited AI queries, priority responses,
            and full commentary access — $12/month.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill
                         bg-saffron text-white font-sans text-ui-xs font-semibold
                         hover:bg-saffron-600 transition-colors"
            >
              <StarIcon />
              Upgrade to Scholar
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="font-sans text-ui-xs text-charcoal-400 hover:text-charcoal
                         transition-colors"
            >
              Remind me later
            </button>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss upgrade prompt"
          className="shrink-0 w-6 h-6 flex items-center justify-center
                     text-charcoal-400 hover:text-charcoal transition-colors"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M6 1l1.2 3.6H11l-2.9 2.1 1.1 3.4L6 8.2 2.8 10.1l1.1-3.4L1 4.6h3.8L6 1z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
