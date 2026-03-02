'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Masthead */}
        <div className="text-center border-b border-[var(--color-rule)] pb-6 mb-8">
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Local Journal
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-[var(--color-rule)]">
            Panel de administración
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--color-rule)] px-3 py-2 text-sm text-[var(--color-ink)] bg-[var(--color-paper)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wider text-[var(--color-ink)] mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--color-rule)] px-3 py-2 text-sm text-[var(--color-ink)] bg-[var(--color-paper)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-700 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] py-2 text-sm uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="border-t border-[var(--color-rule)]" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-paper)] px-3 text-xs text-[var(--color-rule)] uppercase tracking-wider">
            o
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-[var(--color-rule)] py-2 text-sm uppercase tracking-wider text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Continuar con Google
        </button>
      </div>
    </main>
  )
}
