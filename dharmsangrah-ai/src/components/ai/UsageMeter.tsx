'use client';

// ─── UsageMeter ───────────────────────────────────────────────────────────────
// Displays free-tier query usage with a visual bar.
// Variants: full (shown in sidebar/profile) | compact (shown in nav/header)

import Link from 'next/link';
import type { SubscriptionTier } from '@/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsageMeterProps {
  used: number;
  limit: number;
  tier: SubscriptionTier;
  compact?: boolean;
}

// ─── Bar color by usage threshold ─────────────────────────────────────────────

function barColor(percent: number): string {
  if (percent >= 100) return 'bg-error';
  if (percent >= 80)  return 'bg-warning';
  return 'bg-gradient-to-r from-gold-400 to-saffron-500';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UsageMeter({ used, limit, tier, compact = false }: UsageMeterProps) {
  // Scholar tier has unlimited queries
  if (tier === 'scholar') {
    if (compact) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill
                     bg-gold-50 border border-gold-200 text-gold-700
                     font-sans text-ui-xs font-medium"
        >
          <ScholarBadge />
          Scholar
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-50 border border-gold-200">
        <ScholarBadge />
        <span className="font-sans text-ui-sm text-gold-700 font-medium">
          Scholar tier — unlimited queries
        </span>
      </div>
    );
  }

  const safeLimit  = limit > 0 ? limit : 1;
  const percent    = Math.min(Math.round((used / safeLimit) * 100), 100);
  const remaining  = Math.max(safeLimit - used, 0);
  const isExhausted = remaining === 0;
  const color       = barColor(percent);

  // ── Compact variant (nav bar) ────────────────────────────────────────────────
  if (compact) {
    return (
      <div
        className="flex items-center gap-2"
        role="meter"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={safeLimit}
        aria-label={`${used} of ${safeLimit} AI queries used this month`}
      >
        {/* Mini bar */}
        <div className="usage-bar-track w-16">
          <div className={`usage-bar-fill ${color}`} style={{ width: `${percent}%` }} />
        </div>

        <span
          className={`font-sans text-ui-xs font-medium tabular-nums whitespace-nowrap
                     ${isExhausted ? 'text-error' : 'text-charcoal-400'}`}
        >
          {isExhausted ? '0 left' : `${remaining}/${safeLimit}`}
        </span>
      </div>
    );
  }

  // ── Full variant ─────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-lg border border-border bg-parchment-100 p-4"
      role="meter"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={safeLimit}
      aria-label={`${used} of ${safeLimit} AI queries used this month`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-ui-sm font-semibold text-charcoal">
          AI Queries
        </span>
        <span
          className={`font-sans text-ui-sm font-medium tabular-nums
                     ${isExhausted ? 'text-error font-semibold' : 'text-charcoal-400'}`}
        >
          {used} / {safeLimit}
        </span>
      </div>

      {/* Progress bar */}
      <div className="usage-bar-track mb-2">
        <div className={`usage-bar-fill ${color}`} style={{ width: `${percent}%` }} />
      </div>

      {/* Status message */}
      <p
        className={`text-ui-xs font-sans
                   ${isExhausted ? 'text-error' : 'text-charcoal-400'}`}
      >
        {isExhausted
          ? 'Monthly limit reached — resets next month'
          : `${remaining} question${remaining !== 1 ? 's' : ''} remaining this month`}
      </p>

      {/* Upgrade nudge */}
      {percent >= 80 && !isExhausted && (
        <Link
          href="/pricing"
          className="mt-3 block text-center py-2 px-4 rounded-pill
                     border border-gold-300 bg-gold-50 text-gold-700
                     font-sans text-ui-xs font-medium hover:bg-gold-100
                     transition-colors"
        >
          Upgrade to Scholar for unlimited access
        </Link>
      )}
    </div>
  );
}

// ─── Scholar Badge ─────────────────────────────────────────────────────────────

function ScholarBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1l1.3 3.5H11L8.4 6.8l1 3.2L6 8.2 2.6 10l1-3.2L1 4.5h3.7L6 1z"
        fill="currentColor"
      />
    </svg>
  );
}
