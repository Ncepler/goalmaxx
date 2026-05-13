import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { AppShell } from '@/components/nav/AppShell'
import { RoutineClient } from '@/components/routine/RoutineClient'
import { format } from 'date-fns'

export const revalidate = 0

export default async function RoutinePage() {
  const supabase = createAdminClient()

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: profile }, { data: todayPlan }] = await Promise.all([
    supabase.from('profiles').select('bedtime_target').eq('id', USER_ID).single(),
    supabase.from('routine_plans').select('*').eq('user_id', USER_ID).eq('date', today).single(),
  ])

  const bedtimeTarget = (profile as { bedtime_target?: string } | null)?.bedtime_target ?? '23:00'

  return (
    <AppShell>
      <RoutineClient
        bedtimeDefault={bedtimeTarget}
        savedPlan={todayPlan as unknown as import('@/components/routine/RoutineClient').SavedPlan | null}
        today={today}
      />
    </AppShell>
  )
}
