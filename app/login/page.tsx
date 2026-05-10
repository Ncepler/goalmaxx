'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NOAH_EMAIL = 'noahtcepler@gmail.com'

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function sendMagicLink() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: NOAH_EMAIL,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-widest text-gold uppercase">
            GoalMaxx
          </h1>
          <p className="mt-2 text-xs tracking-[0.15em] text-text-secondary uppercase">
            Personal OS
          </p>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-8">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-3xl">✓</div>
              <p className="text-text-primary font-medium">Check your email</p>
              <p className="text-sm text-text-secondary">
                Magic link sent to{' '}
                <span className="text-gold">{NOAH_EMAIL}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-xs text-text-tertiary underline underline-offset-2"
              >
                Send again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[0.15em] text-text-secondary uppercase mb-4">
                  Sign in as
                </p>
                <div className="rounded-lg bg-bg-input border border-border-subtle px-4 py-3 text-text-primary text-sm">
                  {NOAH_EMAIL}
                </div>
              </div>

              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full rounded-lg bg-bg-hover border border-border-strong py-3 text-sm font-medium text-gold tracking-wide disabled:opacity-40 hover:border-gold-dim transition-colors"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
