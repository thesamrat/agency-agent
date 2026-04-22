'use client';

// ─── CommentaryCard ───────────────────────────────────────────────────────────
// Expandable card for a single commentator's text.

import { useState } from 'react';
import type { Commentary } from '@/types';

// ─── Tradition badge colors ────────────────────────────────────────────────────

const TRADITION_COLORS: Record<string, string> = {
  Advaita:    'bg-violet-50 text-violet-700 border-violet-200',
  Vishishtadvaita: 'bg-rose-50 text-rose-700 border-rose-200',
  Dvaita:     'bg-blue-50 text-blue-700 border-blue-200',
  'Bhedabheda': 'bg-teal-50 text-teal-700 border-teal-200',
  'Kashmir Shaivism': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const DEFAULT_TRADITION_COLOR = 'bg-parchment-200 text-charcoal-600 border-border';

// ─── Component ────────────────────────────────────────────────────────────────

interface CommentaryCardProps {
  commentary: Commentary;
}

const PREVIEW_LENGTH = 200;

export function CommentaryCard({ commentary }: CommentaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { commentator, text } = commentary;

  const isLong    = text.length > PREVIEW_LENGTH;
  const displayed = expanded || !isLong ? text : `${text.slice(0, PREVIEW_LENGTH)}…`;

  const traditionColor =
    TRADITION_COLORS[commentator.tradition] ?? DEFAULT_TRADITION_COLOR;

  return (
    <div className="rounded-card border border-border bg-white/70 overflow-hidden
                    transition-shadow hover:shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light">
        {/* Avatar — commentator initial */}
        <div
          className="shrink-0 w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center
                     font-serif font-bold text-navy text-ui-sm"
          aria-hidden="true"
        >
          {commentator.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-ui-sm text-charcoal leading-snug truncate">
            {commentator.name}
          </p>
          {commentator.period && (
            <p className="text-ui-xs text-charcoal-400 font-sans">{commentator.period}</p>
          )}
        </div>

        {/* Tradition badge */}
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-pill
                     border text-ui-xs font-sans font-medium ${traditionColor}`}
        >
          {commentator.tradition}
        </span>
      </div>

      {/* Commentary text */}
      <div className="px-5 py-4">
        <p className="font-serif text-ui-base text-charcoal leading-relaxed">
          {displayed}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-3 text-ui-sm font-sans font-medium text-gold-600
                       hover:text-gold-700 transition-colors"
          >
            {expanded ? 'Show less' : 'Read full commentary'}
          </button>
        )}
      </div>
    </div>
  );
}
