'use client'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { format, parseISO } from 'date-fns'

interface Metrics {
  tasks_completed: number
  tasks_total: number
  workouts: number
  hydration_avg_ml: number
  sleep_avg_min: number
}

export function WeeklyClient({
  weekStart,
  metrics,
}: {
  reviews: unknown[]
  weekStart: string
  metrics: Metrics
}) {
  function fmt(min: number) {
    if (!min) return '—'
    return `${Math.floor(min / 60)}h ${min % 60}m`
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
      <SectionHeader title="WEEKLY SNAPSHOT" />

      <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
        <SectionHeader title={`WEEK OF ${format(parseISO(weekStart), 'MMM d').toUpperCase()}`} />
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Tasks completed" value={metrics.tasks_total > 0 ? `${metrics.tasks_completed} / ${metrics.tasks_total}` : '—'} />
          <Stat label="Workouts" value={String(metrics.workouts)} />
          <Stat label="Avg hydration" value={metrics.hydration_avg_ml > 0 ? `${(metrics.hydration_avg_ml / 1000).toFixed(1)}L` : '—'} />
          <Stat label="Avg sleep" value={fmt(metrics.sleep_avg_min)} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-0.5">{label}</p>
      <p className="text-gold font-bold text-lg tabular-nums">{value}</p>
    </div>
  )
}
