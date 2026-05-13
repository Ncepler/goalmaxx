import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { WeeklyClient } from '@/components/weekly/WeeklyClient'
import { format, startOfWeek, subWeeks } from 'date-fns'

export const revalidate = 0

export default async function WeeklyPage() {
  const supabase = createAdminClient()

  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subWeeks(new Date(), 1), 'yyyy-MM-dd')

  const [
    { data: reviews },
    { data: tasks },
    { data: workouts },
    { data: hydrationLogs },
    { data: sleepLogs },
  ] = await Promise.all([
    supabase.from('weekly_reviews').select('*').eq('user_id', USER_ID).order('week_start', { ascending: false }).limit(10),
    supabase.from('tasks').select('completed, due_date').eq('user_id', USER_ID).gte('due_date', sevenDaysAgo).lte('due_date', today),
    supabase.from('workout_sessions').select('id, date').eq('user_id', USER_ID).gte('date', sevenDaysAgo),
    supabase.from('hydration_logs').select('ml, date').eq('user_id', USER_ID).gte('date', sevenDaysAgo),
    supabase.from('sleep_logs').select('duration_minutes, created_at').eq('user_id', USER_ID).gte('created_at', sevenDaysAgo + 'T00:00:00'),
  ])

  const tasksCompleted = (tasks ?? []).filter(t => t.completed).length
  const tasksTotal = (tasks ?? []).length
  const workoutsCount = (workouts ?? []).length

  const byDate: Record<string, number> = {}
  for (const l of hydrationLogs ?? []) {
    byDate[l.date] = (byDate[l.date] ?? 0) + (l.ml ?? 0)
  }
  const hydrationAvgMl = Object.values(byDate).length
    ? Math.round(Object.values(byDate).reduce((a, b) => a + b, 0) / Object.values(byDate).length)
    : 0

  const completedSleeps = (sleepLogs ?? []).filter(s => s.duration_minutes)
  const sleepAvgMin = completedSleeps.length
    ? Math.round(completedSleeps.reduce((s, l) => s + (l.duration_minutes ?? 0), 0) / completedSleeps.length)
    : 0

  const metrics = {
    tasks_completed: tasksCompleted,
    tasks_total: tasksTotal,
    workouts: workoutsCount,
    hydration_avg_ml: hydrationAvgMl,
    sleep_avg_min: sleepAvgMin,
  }

  return (
    <AppShell>
      <WeeklyClient
        reviews={reviews ?? []}
        weekStart={thisWeekStart}
        metrics={metrics}
      />
    </AppShell>
  )
}
