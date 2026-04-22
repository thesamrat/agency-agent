'use client';

// ─── SearchBar ────────────────────────────────────────────────────────────────
// Controlled or uncontrolled search input with clear button and keyboard submit.

import { useRef, useCallback } from 'react';

interface SearchBarProps {
  /** Controlled value — pass when you want to manage state externally */
  value?: string;
  onChange?: (value: string) => void;
  /** Called on Enter key or explicit search trigger */
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search…',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(e.target.value);
    if (!isControlled) {
      // Uncontrolled — trigger search immediately via onChange
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = inputRef.current?.value ?? value ?? '';
      onSearch(q);
    }
    if (e.key === 'Escape') {
      onChange?.('');
      inputRef.current?.blur();
    }
  }

  function handleClear() {
    onChange?.('');
    inputRef.current?.focus();
  }

  const currentValue = isControlled ? value : undefined;

  return (
    <div
      className="relative flex items-center gap-2 rounded-xl border border-border bg-white
                 shadow-card px-4 py-3 focus-within:border-gold-400
                 focus-within:shadow-gold-glow transition-all duration-150"
    >
      {/* Search icon */}
      <SearchIcon className="shrink-0 text-charcoal-400" />

      {/* Input */}
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        aria-label="Search"
        className="flex-1 bg-transparent text-ui-base text-charcoal
                   placeholder:text-charcoal-400 outline-none font-sans
                   [&::-webkit-search-cancel-button]:hidden"
      />

      {/* Clear button — only when there's content */}
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                     bg-charcoal-100 text-charcoal-400 hover:bg-charcoal-200
                     hover:text-charcoal transition-colors"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      aria-hidden="true" className={className}
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 12.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
