import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { format, subDays } from 'date-fns'
import { AppShell } from '@/components/nav/AppShell'
import { DailyHeader } from '@/components/main/DailyHeader'
import { TaskList } from '@/components/main/TaskList'
import { HydrationCounters } from '@/components/main/HydrationCounters'
import { SleepButton } from '@/components/main/SleepButton'
import { TomorrowPlan } from '@/components/main/TomorrowPlan'
import { FocusToggle } from '@/components/main/FocusToggle'
import { OverseerWidget } from '@/components/main/OverseerWidget'
import { computeDailyScore } from '@/lib/score'

export const revalidate = 0

export default async function MainPage() {
  const supabase = createAdminClient()

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(subDays(new Date(), -1), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

  // Parallel data fetches
  const [
    { data: profile },
    { data: todayTasks },
    { data: tomorrowTasks },
    { data: hydrationLogs },
    { data: sleepLogs },
    { data: workoutSessions },
    { data: activeFocusSessions },
    { data: focusSessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', USER_ID).single(),
    supabase.from('tasks').select('*').eq('user_id', USER_ID).eq('due_date', today).order('created_at'),
    supabase.from('tasks').select('*').eq('user_id', USER_ID).eq('due_date', tomorrow).order('created_at'),
    supabase.from('hydration_logs').select('*').eq('user_id', USER_ID).eq('date', today),
    supabase.from('sleep_logs').select('*').eq('user_id', USER_ID).gte('created_at', sevenDaysAgo + 'T00:00:00').order('created_at', { ascending: false }),
    supabase.from('workout_sessions').select('id').eq('user_id', USER_ID).eq('date', today).limit(1),
    supabase.from('focus_sessions').select('*').eq('user_id', USER_ID).is('ended_at', null).limit(1),
    supabase.from('focus_sessions').select('started_at, ended_at').eq('user_id', USER_ID).eq('broken', false).gte('started_at', today + 'T00:00:00'),
  ])

  // If profile doesn't exist yet, create it
  if (!profile) {
    await supabase.from('profiles').insert({ id: USER_ID })
  }

  const p = {
    water_target_ml: profile?.water_target_ml ?? 3000,
    cup_size_ml: profile?.cup_size_ml ?? 500,
    bottle_size_ml: profile?.bottle_size_ml ?? 500,
    gatorade_size_ml: profile?.gatorade_size_ml ?? 591,
    focus_target_minutes: profile?.focus_target_minutes ?? 240,
  }

  // Sleep stats
  const completedSleepLogs = (sleepLogs ?? []).filter(l => l.sleep_end && l.duration_minutes)
  const activeSleepLog = (sleepLogs ?? []).find(l => !l.sleep_end) ?? null
  const lastCompletedLog = completedSleepLogs[0] ?? null
  const lastNightSleepHours = lastCompletedLog?.duration_minutes
    ? lastCompletedLog.duration_minutes / 60
    : 0
  const sleepPercent = (lastNightSleepHours / 8) * 100

  const sevenDayAvgMinutes = completedSleepLogs.length > 0
    ? Math.round(completedSleepLogs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0) / completedSleepLogs.length)
    : 0

  // Hydration
  const hLogs = hydrationLogs ?? []
  const cups = hLogs.filter(l => l.source === 'cup').length
  const bottles = hLogs.filter(l => l.source === 'bottle').length
  const gatorades = hLogs.filter(l => l.source === 'gatorade').length
  const totalMl = cups * p.cup_size_ml + bottles * p.bottle_size_ml + gatorades * p.gatorade_size_ml

  // Focus minutes today
  const focusMinutes = (focusSessions ?? []).reduce((sum, s) => {
    if (!s.ended_at) return sum
    return sum + Math.floor((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)
  }, 0)

  // Tasks
  const tasks = todayTasks ?? []
  const completedCount = tasks.filter(t => t.completed).length

  // Tomorrow plan check
  const tomorrowPlanFilled = (tomorrowTasks ?? []).length > 0

  // Daily score
  const score = computeDailyScore({
    tasksCompleted: completedCount,
    tasksPlanned: tasks.length,
    waterMlDrunk: totalMl,
    waterTargetMl: p.water_target_ml,
    sleepHours: lastNightSleepHours,
    workoutLoggedToday: (workoutSessions ?? []).length > 0,
    focusMinutes: focusMinutes,
    focusTargetMinutes: p.focus_target_minutes,
    tomorrowPlanFilled,
  })

  const todayContext = {
    date: today,
    score,
    tasks: { completed: completedCount, total: tasks.length },
    waterMl: totalMl,
    waterTargetMl: p.water_target_ml,
    sleepHours: Math.round(lastNightSleepHours * 10) / 10,
    workoutDone: (workoutSessions ?? []).length > 0,
    focusMinutes,
    tomorrowPlanFilled,
  }

  return (
    <AppShell>
      <OverseerWidget todayContext={todayContext} />
      <DailyHeader
        date={today}
        score={score}
        sleepPercent={sleepPercent}
        longestStreak={0}
        sleepBelowTarget={lastCompletedLog !== null && lastNightSleepHours < 7}
      />

      <div className="px-5 py-6 space-y-10 max-w-2xl">
        <TaskList tasks={tasks} date={today} />

        <HydrationCounters
          logs={hLogs}
          date={today}
          cupSizeMl={p.cup_size_ml}
          bottleSizeMl={p.bottle_size_ml}
          gatoradeSizeMl={p.gatorade_size_ml}
          targetMl={p.water_target_ml}
        />

        <SleepButton
          activeSleepLog={activeSleepLog}
          lastCompletedLog={lastCompletedLog}
          sevenDayAvgMinutes={sevenDayAvgMinutes}
        />

        <FocusToggle activeSession={activeFocusSessions?.[0] ?? null} />

        <TomorrowPlan tasks={tomorrowTasks ?? []} todayDate={today} />
      </div>
    </AppShell>
  )
}
