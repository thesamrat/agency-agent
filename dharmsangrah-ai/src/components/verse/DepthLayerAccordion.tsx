'use client';

// ─── DepthLayerAccordion ──────────────────────────────────────────────────────
// The 4-layer progressive depth system. Each layer reveals more scholarly detail.
// Fully accessible — uses disclosure pattern with aria-expanded.

import { useState, useRef, useEffect, useId } from 'react';
import type { DepthLayers } from '@/types';

// ─── Layer metadata ───────────────────────────────────────────────────────────

interface LayerMeta {
  number: 1 | 2 | 3 | 4;
  label: string;
  sublabel: string;
  key: keyof DepthLayers;
  icon: string; // Sanskrit syllable or symbol
}

const LAYERS: LayerMeta[] = [
  {
    number: 1,
    label: 'Essence',
    sublabel: 'One-line meaning',
    key: 'layer_1',
    icon: '१',
  },
  {
    number: 2,
    label: 'Understanding',
    sublabel: 'Accessible exploration',
    key: 'layer_2',
    icon: '२',
  },
  {
    number: 3,
    label: 'Tradition',
    sublabel: 'Commentary synthesis',
    key: 'layer_3',
    icon: '३',
  },
  {
    number: 4,
    label: 'Source',
    sublabel: 'Sanskrit analysis',
    key: 'layer_4',
    icon: '४',
  },
];

// ─── Single Layer Panel ───────────────────────────────────────────────────────

interface LayerPanelProps {
  meta: LayerMeta;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function LayerPanel({ meta, content, isOpen, onToggle, isFirst, isLast }: LayerPanelProps) {
  const id         = useId();
  const headerId   = `layer-header-${id}`;
  const panelId    = `layer-panel-${id}`;
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate height with CSS custom property
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      el.style.maxHeight = `${el.scrollHeight}px`;
      el.style.opacity   = '1';
    } else {
      el.style.maxHeight = '0';
      el.style.opacity   = '0';
    }
  }, [isOpen]);

  return (
    <div
      className={`border border-border bg-white/60 transition-colors
                  ${isFirst ? 'rounded-t-card' : ''}
                  ${isLast  ? 'rounded-b-card' : ''}
                  ${isOpen  ? 'bg-white/90 shadow-card' : 'hover:bg-white/80'}
                  ${!isFirst ? '-mt-px' : ''}
                  relative z-${isOpen ? '10' : '0'}`}
    >
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left
                   focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset
                   focus-visible:outline-none"
      >
        {/* Layer number in Devanagari numeral */}
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                     font-devanagari text-devanagari-sm font-medium transition-colors
                     ${isOpen
                       ? 'bg-gold-500 text-white'
                       : 'bg-parchment-200 text-charcoal-600'
                     }`}
          aria-hidden="true"
        >
          {meta.icon}
        </span>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-sans font-semibold text-ui-base transition-colors
                        ${isOpen ? 'text-gold-700' : 'text-charcoal'}`}
          >
            {meta.label}
          </p>
          <p className="text-ui-xs text-charcoal-400 font-sans">{meta.sublabel}</p>
        </div>

        {/* Layer 1 preview (always visible as teaser) */}
        {meta.number === 1 && !isOpen && (
          <p className="hidden sm:block text-ui-sm text-charcoal-400 font-serif
                        truncate max-w-[200px] flex-shrink text-right italic">
            {content.slice(0, 60)}…
          </p>
        )}

        {/* Chevron */}
        <ChevronIcon
          className={`shrink-0 text-charcoal-400 transition-transform duration-200
                     ${isOpen ? 'rotate-180 text-gold-500' : ''}`}
        />
      </button>

      {/* ── Collapsible Content ──────────────────────────────────────────── */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        ref={contentRef}
        style={{
          maxHeight: isOpen ? undefined : '0',
          opacity:   isOpen ? 1 : 0,
          overflow:  'hidden',
          transition: 'max-height 0.25s ease-out, opacity 0.2s ease-out',
        }}
      >
        <div className="px-5 pb-5 pt-1">
          {/* Thin gold rule */}
          <div className="h-px bg-gold-100 mb-4" />

          {/* Content — different typography per layer */}
          {meta.number === 1 && (
            <p className="font-serif text-ui-xl text-charcoal leading-relaxed">
              {content}
            </p>
          )}

          {meta.number === 2 && (
            <div className="font-serif text-ui-lg text-charcoal leading-relaxed space-y-4">
              {content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {meta.number === 3 && (
            <div className="commentary-prose text-ui-base space-y-4">
              {content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {meta.number === 4 && (
            <div className="space-y-3">
              <p className="font-devanagari text-devanagari-base text-charcoal leading-[2]"
                 lang="sa">
                {content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Accordion ───────────────────────────────────────────────────────────

interface DepthLayerAccordionProps {
  layers: DepthLayers;
  /** Called when a layer is expanded so we can track reading depth */
  onLayerExpand?: (layer: 1 | 2 | 3 | 4) => void;
  /** Default open layer (layer 1 is always open initially) */
  defaultOpen?: 1 | 2 | 3 | 4;
}

export function DepthLayerAccordion({
  layers,
  onLayerExpand,
  defaultOpen = 1,
}: DepthLayerAccordionProps) {
  const [openLayer, setOpenLayer] = useState<number | null>(defaultOpen);

  function toggle(num: 1 | 2 | 3 | 4) {
    if (openLayer === num) {
      setOpenLayer(null);
    } else {
      setOpenLayer(num);
      onLayerExpand?.(num);
    }
  }

  return (
    <div className="rounded-card overflow-hidden" role="list">
      {LAYERS.map((meta, idx) => (
        <div key={meta.number} role="listitem">
          <LayerPanel
            meta={meta}
            content={layers[meta.key]}
            isOpen={openLayer === meta.number}
            onToggle={() => toggle(meta.number)}
            isFirst={idx === 0}
            isLast={idx === LAYERS.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true" className={className}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
