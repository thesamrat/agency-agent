'use client';

// ─── ShareModal ───────────────────────────────────────────────────────────────
// Generates a shareable verse card image (via backend) and provides
// WhatsApp, Twitter/X, copy-link, and image download options.

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { shareAPI } from '@/lib/api/client';
import type { ShareCardRequest, ShareCardResponse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShareModalProps {
  verseRef: string;
  defaultText?: string;
  onClose: () => void;
}

type ShareTheme = 'light' | 'saffron' | 'dark';
type DepthLayer = 1 | 2 | 3 | 4;

// ─── Theme Previews ───────────────────────────────────────────────────────────

const THEME_META: Record<ShareTheme, { label: string; bg: string; text: string }> = {
  light:   { label: 'Parchment', bg: 'bg-parchment', text: 'text-charcoal' },
  saffron: { label: 'Saffron',   bg: 'bg-saffron-100', text: 'text-saffron-800' },
  dark:    { label: 'Dark',      bg: 'bg-navy-900', text: 'text-parchment-50' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ShareModal({ verseRef, defaultText = '', onClose }: ShareModalProps) {
  const [theme, setTheme]           = useState<ShareTheme>('light');
  const [layer, setLayer]           = useState<DepthLayer>(1);
  const [includeSanskrit, setIncludeSanskrit] = useState(true);
  const [result, setResult]         = useState<ShareCardResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef  = useRef<HTMLDivElement>(null);

  // Generate card when options change
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const req: ShareCardRequest = {
        verse_ref: verseRef,
        depth_layer: layer,
        include_sanskrit: includeSanskrit,
        theme,
      };
      const res = await shareAPI.generate(req);
      setResult(res);
    } catch {
      setError('Could not generate share card. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [verseRef, layer, includeSanskrit, theme]);

  useEffect(() => {
    generate();
  }, [generate]);

  // Trap focus inside modal
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    el.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEsc);
    return () => {
      el.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Share helpers
  async function copyLink() {
    const url = result?.share_url ?? window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `${verseRef} — ${defaultText}\n\n${result?.share_url ?? window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }

  function shareTwitter() {
    const text = encodeURIComponent(
      `${verseRef} — "${defaultText}" via @DharmsangrahAI`
    );
    const url  = encodeURIComponent(result?.share_url ?? window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  }

  async function downloadImage() {
    if (!result?.image_url) return;
    const a = document.createElement('a');
    a.href     = result.image_url;
    a.download = `${verseRef.replace(' ', '-')}-dharmsangrah.png`;
    a.click();
  }

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-charcoal-900/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-modal-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm bg-parchment rounded-modal shadow-modal
                   overflow-hidden animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2
            id="share-modal-title"
            className="font-serif text-ui-lg font-semibold text-navy"
          >
            Share {verseRef}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-charcoal-400 hover:bg-parchment-200 hover:text-charcoal
                       transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Card preview */}
        <div className="px-5 pt-4 pb-2">
          <div
            className="relative rounded-lg overflow-hidden border border-border
                       bg-parchment-200 aspect-[4/3] flex items-center justify-center"
          >
            {loading ? (
              <div className="w-full h-full skeleton" />
            ) : result?.image_url ? (
              <Image
                src={result.image_url}
                alt={`Share card for ${verseRef}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <p className="text-ui-sm font-sans text-charcoal-400 p-4 text-center">
                {error ?? 'Preview unavailable'}
              </p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="px-5 py-4 space-y-4">
          {/* Theme selector */}
          <div>
            <p className="text-ui-xs font-sans font-semibold uppercase tracking-wider
                          text-charcoal-400 mb-2">
              Theme
            </p>
            <div className="flex gap-2">
              {(Object.keys(THEME_META) as ShareTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  className={`flex-1 py-1.5 rounded-lg border text-ui-xs font-sans
                             transition-all ${THEME_META[t].bg} ${THEME_META[t].text}
                             ${theme === t
                               ? 'border-gold-400 ring-2 ring-gold-300 ring-offset-1'
                               : 'border-border hover:border-border-strong'
                             }`}
                >
                  {THEME_META[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer selector */}
          <div>
            <p className="text-ui-xs font-sans font-semibold uppercase tracking-wider
                          text-charcoal-400 mb-2">
              Content depth
            </p>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as DepthLayer[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayer(l)}
                  aria-pressed={layer === l}
                  className={`flex-1 py-1.5 rounded-lg border text-ui-xs font-sans
                             transition-colors ${
                               layer === l
                                 ? 'bg-navy text-white border-navy'
                                 : 'border-border text-charcoal-600 hover:border-border-strong'
                             }`}
                >
                  Layer {l}
                </button>
              ))}
            </div>
          </div>

          {/* Include Sanskrit toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={includeSanskrit}
                onChange={(e) => setIncludeSanskrit(e.target.checked)}
              />
              <div
                className="w-9 h-5 rounded-full border border-border bg-parchment-200
                           peer-checked:bg-gold-500 peer-checked:border-gold-500
                           transition-colors"
              />
              <div
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                           shadow-sm transition-transform
                           peer-checked:translate-x-4"
              />
            </div>
            <span className="text-ui-sm font-sans text-charcoal">
              Include Sanskrit text
            </span>
          </label>
        </div>

        {/* Share buttons */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-2.5 rounded-pill
                       bg-[#25D366] text-white font-sans text-ui-sm font-medium
                       hover:bg-[#128C7E] transition-colors"
          >
            <WhatsAppIcon />
            WhatsApp
          </button>

          <button
            onClick={shareTwitter}
            className="flex items-center justify-center gap-2 py-2.5 rounded-pill
                       bg-charcoal-900 text-white font-sans text-ui-sm font-medium
                       hover:bg-charcoal transition-colors"
          >
            <XIcon />
            Post
          </button>

          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 py-2.5 rounded-pill
                       border border-border text-charcoal font-sans text-ui-sm font-medium
                       hover:border-gold-300 hover:bg-gold-50 transition-colors"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <button
            onClick={downloadImage}
            disabled={!result?.image_url || loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-pill
                       border border-border text-charcoal font-sans text-ui-sm font-medium
                       hover:border-gold-300 hover:bg-gold-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>
    </div>
  );

  // Mount in portal to escape stacking contexts
  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.65.07a8.2 8.2 0 01-2.42-1.5 9.1 9.1 0 01-1.68-2.1c-.17-.3-.02-.47.13-.62.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51H8c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49a17 17 0 001.7.62c.71.22 1.36.19 1.87.12.57-.09 1.78-.73 2.03-1.44.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 00-8.71 14.93L2 22l5.24-1.37A10 10 0 1012 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.2 2h3.3L13.8 10.7 22.6 22h-6.5l-5.5-7.2L4.7 22H1.4l8.2-9.4L.6 2h6.7l5 6.6zm-1.2 18h1.8L7.1 3.8H5.2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5.5 8.5a3 3 0 004.24 0l2-2a3 3 0 00-4.24-4.24l-1 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M8.5 5.5a3 3 0 00-4.24 0l-2 2a3 3 0 004.24 4.24l1-1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
