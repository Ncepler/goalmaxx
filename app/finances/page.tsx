import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { FinancesClient } from '@/components/finances/FinancesClient'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export const revalidate = 0

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const [{ data: subs }, { data: orders }, { data: usage }] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('user_id', user.id).order('next_charge_date'),
    supabase.from('incoming_orders').select('*').eq('user_id', user.id).order('expected_date'),
    supabase
      .from('usage_costs')
      .select('cost_usd, input_tokens, output_tokens, feature, created_at')
      .eq('user_id', user.id)
      .gte('created_at', monthStart + 'T00:00:00')
      .order('created_at', { ascending: false }),
  ])

  return (
    <AppShell>
      <FinancesClient
        subscriptions={subs ?? []}
        orders={orders ?? []}
        usageCosts={usage ?? []}
        monthStart={monthStart}
        monthEnd={monthEnd}
      />
    </AppShell>
  )
}
