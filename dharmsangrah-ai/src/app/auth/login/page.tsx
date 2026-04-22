'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? 'Invalid email or password.');
        return;
      }

      const { access_token } = await res.json();
      localStorage.setItem('sb-auth-token', JSON.stringify({ access_token }));
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 bg-parchment">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-serif text-2xl text-navy font-bold">
            Dharmsangrah
          </Link>
          <p className="mt-2 text-charcoal-400 font-sans text-ui-sm">
            Sign in to continue your study
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
          {error && (
            <p role="alert" className="text-red-600 text-ui-sm bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-ui-sm font-sans font-medium text-charcoal mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-ui-base font-sans
                         text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-ui-sm font-sans font-medium text-charcoal mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-ui-base font-sans
                         text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-navy text-white font-sans font-semibold
                       text-ui-base transition-opacity disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-ui-sm text-charcoal-400 font-sans">
          No account?{' '}
          <Link href="/auth/signup" className="text-gold-600 font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}
