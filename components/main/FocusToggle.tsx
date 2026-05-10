'use client'

import { useState, useEffect, useTransition } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { startFocus, endFocus } from '@/app/actions/focus'
import type { FocusSession } from '@/lib/types'

interface FocusToggleProps {
  activeSession: FocusSession | null
}

export function FocusToggle({ activeSession }: FocusToggleProps) {
  const [, startTransition] = useTransition()
  const [elapsed, setElapsed] = useState(0)

  const isLocked = !!activeSession

  useEffect(() => {
    if (!isLocked || !activeSession) return
    const start = new Date(activeSession.started_at).getTime()

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocked, activeSession])

  function formatElapsed(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function handleToggle() {
    startTransition(async () => {
      if (isLocked && activeSession) {
        await endFocus(activeSession.id, false)
      } else {
        await startFocus()
      }
    })
  }

  function handleBreak() {
    if (!activeSession) return
    startTransition(() => endFocus(activeSession.id, true))
  }

  return (
    <div>
      <SectionHeader title="FOCUS" />

      <div className={`rounded-xl border p-5 transition-colors ${
        isLocked
          ? 'bg-bg-elevated border-warning/40'
          : 'bg-bg-elevated border-border-subtle'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isLocked ? (
              <Lock size={18} className="text-warning" />
            ) : (
              <Unlock size={18} className="text-text-tertiary" />
            )}
            <span className={`text-base font-semibold tracking-wider uppercase ${
              isLocked ? 'text-warning' : 'text-text-secondary'
            }`}>
              {isLocked ? 'LOCKED IN' : 'OPEN'}
            </span>
          </div>

          {isLocked && (
            <span className="text-2xl font-bold tabular-nums text-gold">
              {formatElapsed(elapsed)}
            </span>
          )}
        </div>

        {isLocked && activeSession?.unlock_conditions && (
          <p className="text-xs text-text-secondary mb-4">
            {(activeSession.unlock_conditions as { text?: string })?.text}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium tracking-wide transition-colors border ${
              isLocked
                ? 'bg-bg-input border-border-strong text-text-secondary hover:text-text-primary'
                : 'bg-bg-hover border-border-strong text-gold'
            }`}
          >
            {isLocked ? 'End session' : 'Lock in'}
          </button>

          {isLocked && (
            <button
              onClick={handleBreak}
              className="px-3 py-2.5 rounded-lg border border-danger/30 text-danger text-sm font-medium hover:bg-danger/10 transition-colors"
            >
              Broke it
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
