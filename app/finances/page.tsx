import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { AppShell } from '@/components/nav/AppShell'
import { WebClientsClient } from '@/components/finances/WebClientsClient'

export const revalidate = 0

export default async function FinancesPage() {
  const supabase = createAdminClient()

  const { data: clients } = await supabase
    .from('web_clients')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false })

  return (
    <AppShell>
      <WebClientsClient clients={clients ?? []} />
    </AppShell>
  )
}
