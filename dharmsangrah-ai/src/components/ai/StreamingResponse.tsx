'use client';

// ─── StreamingResponse ────────────────────────────────────────────────────────
// Renders SSE streaming text with a blinking cursor while streaming,
// and parses basic markdown for paragraphs and bold text.

import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamingResponseProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

// ─── Minimal markdown parser ──────────────────────────────────────────────────
// Handles: paragraphs (double newline), **bold**, *italic*, `code`
// Full markdown library (remark/react-markdown) adds ~60 kB — overkill here.

function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Patterns: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIdx) {
      result.push(text.slice(lastIdx, match.index));
    }

    if (match[1]) {
      // **bold**
      result.push(<strong key={match.index} className="font-semibold text-charcoal">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      result.push(<em key={match.index}>{match[4]}</em>);
    } else if (match[5]) {
      // `code`
      result.push(
        <code
          key={match.index}
          className="px-1 py-0.5 rounded bg-parchment-200 font-mono text-ui-sm text-charcoal"
        >
          {match[6]}
        </code>
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    result.push(text.slice(lastIdx));
  }

  return result;
}

function renderParagraphs(text: string, showCursor: boolean): React.ReactNode {
  // Split on double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, i) => {
    const isLast     = i === paragraphs.length - 1;
    const parsedLine = parseInline(para.trim());

    return (
      <p
        key={i}
        className="font-serif text-ui-base text-charcoal leading-relaxed"
      >
        {parsedLine}
        {/* Blinking cursor on the last paragraph while streaming */}
        {isLast && showCursor && (
          <span
            aria-hidden="true"
            className="inline-block w-0.5 h-4 bg-saffron-500 ml-0.5 -mb-0.5
                       align-middle animate-cursor-blink will-change-opacity"
          />
        )}
      </p>
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StreamingResponse({
  text,
  isStreaming,
  className = '',
}: StreamingResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll within a bounded container as text grows
  useEffect(() => {
    if (!isStreaming) return;
    containerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [text, isStreaming]);

  if (!text && !isStreaming) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={isStreaming ? 'AI response streaming' : 'AI response'}
      aria-live={isStreaming ? 'polite' : undefined}
      aria-atomic="false"
      className={`space-y-3 ${className}`}
    >
      {text ? (
        renderParagraphs(text, isStreaming)
      ) : (
        // Empty state while first chunk arrives
        isStreaming && (
          <p className="font-serif text-ui-base text-charcoal-400 italic">
            Consulting the commentaries
            <span
              aria-hidden="true"
              className="inline-block w-0.5 h-4 bg-saffron-500 ml-0.5 -mb-0.5
                         align-middle animate-cursor-blink"
            />
          </p>
        )
      )}
    </div>
  );
}
