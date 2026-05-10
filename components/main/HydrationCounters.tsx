'use client'

import { useTransition } from 'react'
import { Minus, Plus, Droplets } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { logHydration, removeHydration } from '@/app/actions/hydration'
import type { HydrationLog } from '@/lib/types'

interface HydrationCountersProps {
  logs: HydrationLog[]
  date: string
  cupSizeMl: number
  bottleSizeMl: number
  gatoradeSizeMl: number
  targetMl: number
}

export function HydrationCounters({
  logs,
  date,
  cupSizeMl,
  bottleSizeMl,
  gatoradeSizeMl,
  targetMl,
}: HydrationCountersProps) {
  const [, startTransition] = useTransition()

  const cups = logs.filter(l => l.source === 'cup').length
  const bottles = logs.filter(l => l.source === 'bottle').length
  const gatorades = logs.filter(l => l.source === 'gatorade').length
  const totalMl = cups * cupSizeMl + bottles * bottleSizeMl + gatorades * gatoradeSizeMl

  const sources = [
    { key: 'cup' as const, label: 'Home Cup', count: cups, ml: cupSizeMl, emoji: '☕' },
    { key: 'bottle' as const, label: 'Bottle', count: bottles, ml: bottleSizeMl, emoji: '🍶' },
    { key: 'gatorade' as const, label: 'Gatorade', count: gatorades, ml: gatoradeSizeMl, emoji: '🥤' },
  ]

  const inHealthyZone = totalMl >= targetMl * 0.8 && totalMl <= targetMl * 1.3

  return (
    <div>
      <SectionHeader title="WATER" />

      {/* Big total */}
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-bold tabular-nums text-gold">
          {(totalMl / 1000).toFixed(1)}L
        </span>
        <span className="text-sm text-text-tertiary">of {(targetMl / 1000).toFixed(1)}L</span>
        {inHealthyZone && (
          <span className="ml-auto text-xs text-success">✓ healthy zone</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <ProgressBar
          value={totalMl / targetMl}
          color={totalMl >= targetMl ? 'success' : 'gold'}
        />
      </div>

      {/* 3 counters */}
      <div className="grid grid-cols-3 gap-3">
        {sources.map(({ key, label, count, ml, emoji }) => (
          <div key={key} className="rounded-xl bg-bg-elevated border border-border-subtle p-3">
            <div className="text-lg mb-1">{emoji}</div>
            <div className="text-[10px] tracking-[0.1em] text-text-tertiary uppercase mb-2">
              {label}
            </div>
            <div className="text-xl font-bold tabular-nums text-gold mb-1">{count}</div>
            <div className="text-[10px] text-text-tertiary mb-3">{(count * ml / 1000).toFixed(2)}L</div>

            <div className="flex gap-1">
              <button
                onClick={() => startTransition(() => removeHydration(key, date))}
                disabled={count === 0}
                className="flex-1 flex items-center justify-center h-7 rounded-lg bg-bg-input border border-border-subtle text-text-tertiary hover:text-text-secondary disabled:opacity-30 transition-colors"
                aria-label={`Remove ${label}`}
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => startTransition(() => logHydration(key, ml))}
                className="flex-1 flex items-center justify-center h-7 rounded-lg bg-bg-input border border-border-subtle text-gold hover:text-gold-bright transition-colors"
                aria-label={`Add ${label}`}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!inHealthyZone && totalMl < targetMl * 0.8 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-warning">
          <Droplets size={12} />
          {Math.round((targetMl - totalMl) / 1000 * 10) / 10}L to go
        </div>
      )}
    </div>
  )
}
