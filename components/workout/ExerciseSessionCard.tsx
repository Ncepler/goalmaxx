'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { logSet, getOrCreateTodaySession } from '@/app/actions/workout'
import { epley1RM, getProgression } from '@/lib/workout'
import type { Database } from '@/lib/types'

type Exercise = Database['public']['Tables']['exercises']['Row']
type SetRow = Database['public']['Tables']['sets']['Row']

interface Props {
  exercise: Exercise
  lastSet: SetRow | null
  todaysSets: SetRow[]
  sessionId: string | null
}

export function ExerciseSessionCard({ exercise, lastSet, todaysSets, sessionId: initialSessionId }: Props) {
  const [weight, setWeight] = useState(lastSet?.weight_kg?.toString() ?? '20')
  const [reps, setReps] = useState(exercise.rep_range_low?.toString() ?? '6')
  const [sessionId, setSessionId] = useState(initialSessionId)
  const [, startTransition] = useTransition()

  const repLow = exercise.rep_range_low ?? 6
  const repHigh = exercise.rep_range_high ?? 8
  const increment = exercise.weight_increment_kg ?? 2.5
  const isCompound = ['chest', 'back', 'legs', 'shoulders'].includes((exercise.muscle_group ?? '').toLowerCase())

  const progression = getProgression(
    lastSet?.weight_kg ?? null,
    lastSet?.reps ?? null,
    repLow,
    repHigh,
    Number(increment),
    isCompound
  )

  const todayBest = todaysSets.length > 0
    ? todaysSets.reduce((best, s) => epley1RM(s.weight_kg, s.reps) > epley1RM(best.weight_kg, best.reps) ? s : best)
    : null

  async function handleLogSet() {
    startTransition(async () => {
      let sid = sessionId
      if (!sid) {
        sid = await getOrCreateTodaySession()
        if (sid) setSessionId(sid)
      }
      if (!sid) return

      const fd = new FormData()
      fd.append('session_id', sid)
      fd.append('exercise_id', exercise.id)
      fd.append('weight_kg', weight)
      fd.append('reps', reps)
      fd.append('set_order', String(todaysSets.length + 1))
      await logSet(fd)
    })
  }

  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">{exercise.name}</h3>
          {exercise.muscle_group && (
            <p className="text-xs text-text-tertiary mt-0.5 uppercase tracking-wide">{exercise.muscle_group}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${
            progression.decision === 'PROGRESS' ? 'bg-success/20 text-success' :
            progression.decision === 'REPEAT' ? 'text-warning' : 'text-text-tertiary'
          }`}>
            {progression.decision}
          </span>
          <Link href={`/workout/${exercise.id}`} className="text-text-tertiary hover:text-text-secondary">
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Target */}
      <div className="text-2xl font-bold tabular-nums text-gold mb-1">
        {progression.targetWeight}kg × {progression.targetReps} reps
      </div>
      <p className="text-xs text-text-secondary mb-4 leading-relaxed">{progression.tip}</p>

      {/* Today's sets */}
      {todaysSets.length > 0 && (
        <div className="mb-4 space-y-1">
          {todaysSets.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="text-text-tertiary">Set {i + 1}</span>
              <span>{s.weight_kg}kg × {s.reps} reps</span>
              <span className="text-text-tertiary ml-auto">~{epley1RM(s.weight_kg, s.reps)}kg 1RM</span>
            </div>
          ))}
        </div>
      )}

      {/* Log set form */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            step="2.5"
            min="0"
            className="w-full rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-strong tabular-nums"
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            min="1"
            max="30"
            className="w-full rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-strong tabular-nums"
          />
        </div>
        <div className="pt-5">
          <button
            onClick={handleLogSet}
            className="px-4 py-2 rounded-lg bg-bg-hover border border-border-strong text-gold text-sm font-medium"
          >
            Log
          </button>
        </div>
      </div>
    </div>
  )
}
