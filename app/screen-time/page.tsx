import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ScreenTimeClient } from '@/components/screen-time/ScreenTimeClient'
import { format, subDays } from 'date-fns'

export const revalidate = 0

export default async function ScreenTimePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const [{ data: logs }, { data: profile }] = await Promise.all([
    supabase
      .from('screen_time_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
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
