'use client';

// ─── AI Q&A Interface ─────────────────────────────────────────────────────────
// Streaming question → answer with citation chips, usage meter, upgrade CTA.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { streamAIQuery } from '@/lib/api/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { StreamingResponse } from '@/components/ai/StreamingResponse';
import { CitationChip } from '@/components/ai/CitationChip';
import { UsageMeter } from '@/components/ai/UsageMeter';
import { UpgradeBanner } from '@/components/subscription/UpgradeBanner';
import type { Citation, AIInteraction } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED = [
  'What does Krishna mean by "do your duty without attachment to results"?',
  'How do I deal with grief according to the Gita?',
  'What is the difference between Jnana Yoga and Bhakti Yoga?',
  'What does the Gita say about the nature of the soul?',
  'How should one face moral dilemmas, according to Krishna?',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamState {
  status: 'idle' | 'streaming' | 'done' | 'error';
  text: string;
  citations: Citation[];
  error?: string;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AskPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { profile, isLoading: profileLoading } = useUserProfile();

  const [question, setQuestion]     = useState(searchParams.get('q') ?? '');
  const [contextVerse, setContextVerse] = useState(searchParams.get('verse') ?? '');
  const [stream, setStream]         = useState<StreamState>({
    status: 'idle', text: '', citations: [],
  });
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [feedback, setFeedback]     = useState<Record<string, 'up' | 'down'>>({});

  const abortRef  = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-submit if URL has a question
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuestion(q);
      // Defer so state settles first
      setTimeout(() => handleSubmit(q), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when streaming
  useEffect(() => {
    if (stream.status === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [stream.text, stream.status]);

  // Auto-resize textarea
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const isAtLimit =
    profile?.subscription.tier === 'free' &&
    profile.subscription.queries_used >= profile.subscription.queries_limit;

  const handleSubmit = useCallback(
    async (q?: string) => {
      const questionText = (q ?? question).trim();
      if (!questionText || stream.status === 'streaming') return;

      // Cancel any existing stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStream({ status: 'streaming', text: '', citations: [] });
      const interactionId = crypto.randomUUID();
      let finalText = '';
      let finalCitations: Citation[] = [];

      streamAIQuery(
        { question: questionText, context_verse_ref: contextVerse || undefined },
        {
          onChunk: (text) => {
            finalText += text;
            setStream((s) => ({ ...s, text: s.text + text }));
          },
          onCitations: (citations) => {
            finalCitations = citations;
            setStream((s) => ({ ...s, citations }));
          },
          onDone: (id, tokensUsed) => {
            setStream((s) => ({ ...s, status: 'done' }));
            setInteractions((prev) => [
              {
                id,
                question: questionText,
                answer: finalText,
                citations: finalCitations,
                tokens_used: tokensUsed,
                created_at: new Date().toISOString(),
              },
              ...prev,
            ]);
            setQuestion('');
            // Reset textarea height
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
            }
          },
          onError: (err) => {
            setStream({ status: 'error', text: '', citations: [], error: err.message });
          },
        },
        controller.signal
      );
    },
    [question, contextVerse, stream.status]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleFeedback(interactionId: string, value: 'up' | 'down') {
    setFeedback((f) => ({ ...f, [interactionId]: value }));
    // Fire-and-forget to backend (not shown for brevity)
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-parchment/95
                         backdrop-blur-sm px-5 py-3 safe-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-serif text-ui-lg text-navy font-semibold hover:text-gold-600
                       transition-colors"
          >
            ← Dharmsangrah
          </Link>

          {/* Usage meter */}
          {!profileLoading && profile && (
            <UsageMeter
              used={profile.subscription.queries_used}
              limit={profile.subscription.queries_limit}
              tier={profile.subscription.tier}
              compact
            />
          )}
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 px-5 py-6 md:px-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Upgrade banner — shown non-intrusively when at limit */}
          {isAtLimit && (
            <UpgradeBanner
              queriesUsed={profile!.subscription.queries_used}
              queriesLimit={profile!.subscription.queries_limit}
            />
          )}

          {/* Context verse indicator */}
          {contextVerse && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                         bg-gold-50 border border-gold-200 text-ui-sm font-sans"
            >
              <span className="text-gold-600 font-medium">Context:</span>
              <Link
                href={`/verses/${encodeURIComponent(contextVerse)}`}
                className="text-charcoal hover:text-gold-700 transition-colors"
              >
                {contextVerse}
              </Link>
              <button
                onClick={() => setContextVerse('')}
                className="ml-auto text-charcoal-400 hover:text-charcoal transition-colors"
                aria-label="Remove context verse"
              >
                ×
              </button>
            </div>
          )}

          {/* Previous interactions */}
          {interactions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              feedbackValue={feedback[interaction.id]}
              onFeedback={(v) => handleFeedback(interaction.id, v)}
            />
          ))}

          {/* Live streaming response */}
          {stream.status !== 'idle' && (
            <div className="rounded-card border border-border bg-white/80 p-5 shadow-card
                            animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <GitaIcon />
                <span className="font-sans text-ui-sm font-semibold text-navy">
                  Dharmsangrah AI
                </span>
                {stream.status === 'streaming' && (
                  <span className="ml-auto text-ui-xs text-charcoal-400 font-sans
                                   flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-saffron
                                     animate-pulse" />
                    Thinking…
                  </span>
                )}
              </div>

              {stream.status === 'error' ? (
                <p className="text-error text-ui-sm font-sans">{stream.error}</p>
              ) : (
                <StreamingResponse
                  text={stream.text}
                  isStreaming={stream.status === 'streaming'}
                />
              )}

              {/* Citations */}
              {stream.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border-light flex flex-wrap gap-2">
                  <span className="text-ui-xs font-sans text-charcoal-400 w-full mb-1">
                    Sources:
                  </span>
                  {stream.citations.map((citation) => (
                    <CitationChip key={`${citation.verse_ref}-${citation.commentator}`}
                      citation={citation}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suggested questions (only when idle / no interactions) */}
          {stream.status === 'idle' && interactions.length === 0 && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-ui-sm font-sans text-charcoal-400 mb-3">
                Try asking:
              </p>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuestion(q); handleSubmit(q); }}
                  className="block w-full text-left px-4 py-3 rounded-lg border border-border
                             bg-white/60 text-ui-sm text-charcoal hover:border-gold-300
                             hover:bg-gold-50 transition-colors duration-150"
                >
                  <span className="text-gold-500 mr-2">›</span>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </main>

      {/* ── Input Bar (sticky bottom) ─────────────────────────────────────── */}
      <div className="sticky bottom-0 z-20 border-t border-border
                      bg-parchment/95 backdrop-blur-sm safe-bottom">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <div
            className={`flex items-end gap-2 rounded-xl border bg-white shadow-card px-4 py-3
                        transition-shadow focus-within:shadow-gold-glow
                        ${isAtLimit ? 'opacity-60 pointer-events-none' : 'border-border'}`}
          >
            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isAtLimit
                  ? 'Upgrade to Scholar for unlimited questions'
                  : 'Ask anything about the Bhagavad Gita…'
              }
              disabled={isAtLimit || stream.status === 'streaming'}
              rows={1}
              aria-label="Your question"
              className="flex-1 resize-none bg-transparent text-ui-base text-charcoal
                         placeholder:text-charcoal-400 outline-none font-sans
                         leading-relaxed min-h-[1.5rem] max-h-36 overflow-y-auto"
              style={{ height: 'auto' }}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={
                !question.trim() ||
                stream.status === 'streaming' ||
                isAtLimit
              }
              aria-label="Send question"
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                         bg-saffron text-white disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-saffron-600 active:scale-95 transition-all"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-ui-xs text-charcoal-400 font-sans text-center mt-2">
            ⌘ + Enter to send · AI may make errors — verify with source texts
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Interaction Card ─────────────────────────────────────────────────────────

interface InteractionCardProps {
  interaction: AIInteraction;
  feedbackValue?: 'up' | 'down';
  onFeedback: (v: 'up' | 'down') => void;
}

function InteractionCard({ interaction, feedbackValue, onFeedback }: InteractionCardProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* User question */}
      <div className="flex justify-end">
        <div
          className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm
                     bg-navy text-white font-sans text-ui-sm leading-relaxed"
        >
          {interaction.question}
        </div>
      </div>

      {/* AI response */}
      <div className="rounded-card border border-border bg-white/80 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <GitaIcon />
          <span className="font-sans text-ui-sm font-semibold text-navy">Dharmsangrah AI</span>
        </div>

        <StreamingResponse text={interaction.answer} isStreaming={false} />

        {/* Citations */}
        {interaction.citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-light flex flex-wrap gap-2">
            <span className="text-ui-xs font-sans text-charcoal-400 w-full mb-1">Sources:</span>
            {interaction.citations.map((c) => (
              <CitationChip key={`${c.verse_ref}-${c.commentator}`} citation={c} />
            ))}
          </div>
        )}

        {/* Feedback */}
        <div className="mt-4 pt-3 border-t border-border-light flex items-center gap-2">
          <span className="text-ui-xs font-sans text-charcoal-400 mr-1">Helpful?</span>
          <button
            onClick={() => onFeedback('up')}
            aria-label="Thumbs up"
            aria-pressed={feedbackValue === 'up'}
            className={`p-1.5 rounded-lg transition-colors ${
              feedbackValue === 'up'
                ? 'bg-success/10 text-success'
                : 'text-charcoal-400 hover:text-charcoal hover:bg-parchment-200'
            }`}
          >
            <ThumbsUp />
          </button>
          <button
            onClick={() => onFeedback('down')}
            aria-label="Thumbs down"
            aria-pressed={feedbackValue === 'down'}
            className={`p-1.5 rounded-lg transition-colors ${
              feedbackValue === 'down'
                ? 'bg-error/10 text-error'
                : 'text-charcoal-400 hover:text-charcoal hover:bg-parchment-200'
            }`}
          >
            <ThumbsDown />
          </button>
          <span className="ml-auto text-ui-xs font-sans text-charcoal-400">
            {interaction.tokens_used} tokens
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GitaIcon() {
  return (
    <div
      className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-saffron-500
                 flex items-center justify-center text-white text-ui-xs font-serif font-bold"
    >
      ग
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 8L2 2l3 6-3 6 12-6z"
        fill="currentColor"
      />
    </svg>
  );
}

function ThumbsUp() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M8.5 2.5A1.5 1.5 0 017 4L6 8h6.5a1 1 0 01.97 1.24l-1 4A1 1 0 0111.5 14H3v-6h2l3-5.5z"
        stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round"
      />
    </svg>
  );
}

function ThumbsDown() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M6.5 12.5A1.5 1.5 0 008 11l1-4H2.5a1 1 0 01-.97-1.24l1-4A1 1 0 013.5 1H12v6h-2l-3 5.5z"
        stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round"
      />
    </svg>
  );
}
