import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { format } from 'date-fns'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ExerciseSessionCard } from '@/components/workout/ExerciseSessionCard'
import { AddExerciseForm } from '@/components/workout/AddExerciseForm'
import type { Database } from '@/lib/types'

export const revalidate = 0

type Exercise = Database['public']['Tables']['exercises']['Row']
type SetRow = Database['public']['Tables']['sets']['Row']

export default async function WorkoutPage() {
  const supabase = createAdminClient()

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: exercises }, { data: todaySession }] = await Promise.all([
    supabase.from('exercises').select('*').eq('user_id', USER_ID).order('created_at'),
    supabase.from('workout_sessions').select('*').eq('user_id', USER_ID).eq('date', today).single(),
  ])

  const sessionId = todaySession?.id ?? null

  const { data: todaysSets } = sessionId
    ? await supabase.from('sets').select('*').eq('session_id', sessionId).order('logged_at')
    : { data: [] }

  const exerciseIds = (exercises ?? []).map((e: Exercise) => e.id)

  let lastSetByExercise: Record<string, SetRow> = {}

  if (exerciseIds.length > 0) {
    const { data: recentSets } = await supabase
      .from('sets')
      .select('*, workout_sessions!inner(date, user_id)')
      .eq('workout_sessions.user_id', USER_ID)
      .in('exercise_id', exerciseIds)
      .order('logged_at', { ascending: false })
      .limit(500)

    for (const s of (recentSets ?? []) as unknown as (SetRow & { workout_sessions: { date: string } })[]) {
      if (!lastSetByExercise[s.exercise_id]) lastSetByExercise[s.exercise_id] = s
    }
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-2xl space-y-8">
        <SectionHeader title="NEXT SESSION" />

        {(exercises ?? []).length === 0 ? (
          <p className="text-text-tertiary text-sm">No exercises yet. Add one below.</p>
        ) : (
          <div className="space-y-4 stagger-list">
            {(exercises ?? []).map((exercise: Exercise) => (
              <ExerciseSessionCard
                key={exercise.id}
                exercise={exercise}
                lastSet={lastSetByExercise[exercise.id] ?? null}
                todaysSets={(todaysSets ?? []).filter((s: SetRow) => s.exercise_id === exercise.id)}
                sessionId={sessionId}
              />
            ))}
          </div>
        )}

        <AddExerciseForm />
      </div>
    </AppShell>
  )
}
