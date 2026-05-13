import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ScreenTimeClient } from '@/components/screen-time/ScreenTimeClient'
import { format, subDays } from 'date-fns'

export const revalidate = 0

export default async function ScreenTimePage() {
  const supabase = createAdminClient()

  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const [{ data: logs }, { data: profile }] = await Promise.all([
    supabase
      .from('screen_time_logs')
      .select('*')
      .eq('user_id', USER_ID)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', USER_ID).single(),
  ])

  return (
    <AppShell>
      <ScreenTimeClient
        logs={logs ?? []}
        dailyLimitMinutes={180}
      />
    </AppShell>
  )
}
