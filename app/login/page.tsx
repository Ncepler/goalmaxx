'use client'

import { useState } from 'react'
import { pinLogin } from '@/app/actions/auth'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await pinLogin(pin)
    if (result?.error) {
      setError(result.error)
      setPin('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-sm animate-in">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-widest text-gold uppercase">
            GoalMaxx
          </h1>
          <p className="mt-2 text-xs tracking-[0.15em] text-text-secondary uppercase">
            Personal OS
          </p>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-xs tracking-[0.15em] text-text-secondary uppercase mb-4">
                Enter PIN
              </p>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                maxLength={8}
                autoFocus
                className="w-full rounded-lg bg-bg-input border border-border-subtle px-4 py-3 text-text-primary text-sm text-center tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:border-gold/50"
              />
            </div>

            {error && (
              <p className="text-sm text-danger text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full rounded-lg bg-gold/10 border border-gold/30 hover:bg-gold/15 hover:border-gold/50 py-3 text-sm font-semibold text-gold tracking-wide disabled:opacity-40 transition-colors"
            >
              {loading ? 'Verifying…' : 'Unlock →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
