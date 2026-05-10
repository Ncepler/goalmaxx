'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { saveWeeklyReview } from '@/app/actions/weekly'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Review {
  id: string
  week_start: string
  worked_md: string | null
  didnt_work_md: string | null
  next_week_focus_md: string | null
  created_at: string | null
}

interface Metrics {
  tasks_completed: number
  tasks_total: number
  workouts: number
  hydration_avg_ml: number
  sleep_avg_min: number
}

export function WeeklyClient({
  reviews,
  weekStart,
  metrics,
}: {
  reviews: Review[]
  weekStart: string
  metrics: Metrics
}) {
  const [, startTransition] = useTransition()
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const thisWeekReview = reviews.find(r => r.week_start === weekStart)

  const [worked, setWorked] = useState(thisWeekReview?.worked_md ?? '')
  const [didntWork, setDidntWork] = useState(thisWeekReview?.didnt_work_md ?? '')
  const [nextFocus, setNextFocus] = useState(thisWeekReview?.next_week_focus_md ?? '')

  function fmt(min: number) {
    if (!min) return '—'
    return `${Math.floor(min / 60)}h ${min % 60}m`
  }

  function handleSave(fd: FormData) {
    startTransition(async () => {
      await saveWeeklyReview(fd)
      router.refresh()
    })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
      <SectionHeader title="WEEKLY REVIEW" />

      {/* This week's metrics snapshot */}
      <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
        <SectionHeader title={`WEEK OF ${format(parseISO(weekStart), 'MMM d').toUpperCase()}`} />
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Tasks completed" value={metrics.tasks_total > 0 ? `${metrics.tasks_completed} / ${metrics.tasks_total}` : '—'} />
          <Stat label="Workouts" value={String(metrics.workouts)} />
          <Stat label="Avg hydration" value={metrics.hydration_avg_ml > 0 ? `${(metrics.hydration_avg_ml / 1000).toFixed(1)}L` : '—'} />
          <Stat label="Avg sleep" value={fmt(metrics.sleep_avg_min)} />
        </div>
      </div>

      {/* Review form */}
      <form action={handleSave} className="space-y-4">
        <TextArea
          label="What worked this week?"
          name="worked_md"
          value={worked}
          onChange={setWorked}
          placeholder="What went well, what habits held..."
        />
        <TextArea
          label="What didn't work?"
          name="didnt_work_md"
          value={didntWork}
          onChange={setDidntWork}
          placeholder="Slips, missed targets, obstacles..."
        />
        <TextArea
          label="One thing to do differently next week"
          name="next_week_focus_md"
          value={nextFocus}
          onChange={setNextFocus}
          placeholder="Specific change, not a vague goal..."
        />
        <button type="submit" className="w-full py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-gold text-sm font-medium hover:border-gold transition-colors duration-150">
          Save review
        </button>
      </form>

      {/* Past reviews */}
      {reviews.filter(r => r.week_start !== weekStart).length > 0 && (
        <>
          <SectionHeader title="PAST REVIEWS" />
          <div className="space-y-2">
            {reviews
              .filter(r => r.week_start !== weekStart)
              .map(r => (
                <div key={r.id} className="rounded-xl bg-bg-elevated border border-border-subtle overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors duration-150"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <span className="text-sm text-text-primary font-medium">
                      Week of {format(parseISO(r.week_start), 'MMM d, yyyy')}
                    </span>
                    {expandedId === r.id ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
                  </button>
                  {expandedId === r.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                      {r.worked_md && <ReviewSection title="What worked" body={r.worked_md} />}
                      {r.didnt_work_md && <ReviewSection title="What didn't" body={r.didnt_work_md} />}
                      {r.next_week_focus_md && <ReviewSection title="Focus for next week" body={r.next_week_focus_md} />}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
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

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1.5">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150 resize-none"
      />
    </div>
  )
}

function ReviewSection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">{title}</p>
      <p className="text-text-secondary text-sm whitespace-pre-wrap">{body}</p>
    </div>
  )
}
