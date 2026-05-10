import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { RoutineClient } from '@/components/routine/RoutineClient'
import { format } from 'date-fns'

export const revalidate = 0

export default async function RoutinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: profile }, { data: todayPlan }] = await Promise.all([
    supabase.from('profiles').select('bedtime_target').eq('id', user.id).single(),
    supabase.from('routine_plans').select('*').eq('user_id', user.id).eq('date', today).single(),
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
