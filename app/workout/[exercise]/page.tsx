import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { epley1RM } from '@/lib/workout'
import { ExerciseTrendChart } from '@/components/workout/ExerciseTrendChart'
import type { Database } from '@/lib/types'

export const revalidate = 0
type SetRow = Database['public']['Tables']['sets']['Row'] & { workout_sessions: { date: string } }

export default async function ExerciseDetailPage({ params }: { params: Promise<{ exercise: string }> }) {
  const { exercise: exerciseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: exercise }, { data: allSets }] = await Promise.all([
    supabase.from('exercises').select('*').eq('id', exerciseId).eq('user_id', user.id).single(),
    supabase.from('sets')
      .select('*, workout_sessions!inner(date, user_id)')
      .eq('workout_sessions.user_id', user.id)
      .eq('exercise_id', exerciseId)
      .order('logged_at', { ascending: false })
      .limit(200),
  ])

  if (!exercise) redirect('/workout')

  const sets = (allSets ?? []) as unknown as SetRow[]

  // Best 1RM overall
  const best1RM = sets.length > 0
    ? Math.max(...sets.map(s => epley1RM(s.weight_kg, s.reps)))
    : 0

  // Best set (highest weight × reps combo)
  const bestSet = sets.length > 0
    ? sets.reduce((b, s) => s.weight_kg > b.weight_kg ? s : b)
    : null

  // Group by session date for history
  const sessionMap = new Map<string, SetRow[]>()
  for (const s of sets) {
    const date = s.workout_sessions.date
    if (!sessionMap.has(date)) sessionMap.set(date, [])
    sessionMap.get(date)!.push(s)
  }

  const sessionDates = Array.from(sessionMap.keys()).sort((a, b) => b.localeCompare(a))

  // Trend data: best 1RM per session (last 10)
  const trendData = sessionDates.slice(0, 10).reverse().map(date => {
    const setsForDate = sessionMap.get(date)!
    const best = Math.max(...setsForDate.map(s => epley1RM(s.weight_kg, s.reps)))
    return { date, oneRM: best }
  })

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-2xl space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gold">{exercise.name}</h1>
          {exercise.muscle_group && <p className="text-xs text-text-tertiary mt-1 uppercase tracking-wider">{exercise.muscle_group}</p>}
        </div>

        {/* Stats row */}
        <SectionHeader title="STATS" />
        <div className="grid grid-cols-3 gap-3 stagger-list">
          <StatCard label="EST. 1RM" value={best1RM > 0 ? `${best1RM}kg` : '—'} />
          <StatCard label="BEST SET" value={bestSet ? `${bestSet.weight_kg}×${bestSet.reps}` : '—'} />
          <StatCard label="REP RANGE" value={`${exercise.rep_range_low}–${exercise.rep_range_high}`} />
        </div>

        {/* Trend chart */}
        {trendData.length > 1 && (
          <>
            <SectionHeader title="TREND (LAST 10 SESSIONS)" />
            <ExerciseTrendChart data={trendData} />
          </>
        )}

        {/* Session history */}
        <SectionHeader title="HISTORY" />
        {sessionDates.length === 0 ? (
          <p className="text-text-tertiary text-sm">No sessions logged yet.</p>
        ) : (
          <div className="space-y-4 stagger-list">
            {sessionDates.map(date => {
              const sessionSets = sessionMap.get(date)!
              const best = Math.max(...sessionSets.map(s => epley1RM(s.weight_kg, s.reps)))
              return (
                <div key={date} className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">{date}</span>
                    <span className="text-xs text-text-tertiary">~{best}kg 1RM</span>
                  </div>
                  <div className="space-y-1">
                    {sessionSets.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 text-sm">
                        <span className="text-text-tertiary w-12">Set {i + 1}</span>
                        <span className="text-text-primary tabular-nums">{s.weight_kg}kg × {s.reps} reps</span>
                        {s.rpe && <span className="text-text-tertiary text-xs ml-auto">RPE {s.rpe}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
      <div className="text-[10px] tracking-[0.15em] text-text-tertiary uppercase mb-2">{label}</div>
      <div className="text-xl font-bold tabular-nums text-gold">{value}</div>
    </div>
  )
}
