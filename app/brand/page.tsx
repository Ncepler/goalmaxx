import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { BrandClient } from '@/components/brand/BrandClient'

export const revalidate = 0

export default async function BrandPage() {
  const supabase = createAdminClient()

  const [{ data: accounts }, { data: snapshots }] = await Promise.all([
    supabase.from('brand_accounts').select('*').eq('user_id', USER_ID).order('platform'),
    supabase
      .from('brand_snapshots')
      .select('*')
      .eq('user_id', USER_ID)
      .order('date', { ascending: false })
      .limit(200),
  ])

  return (
    <AppShell>
      <BrandClient accounts={accounts ?? []} snapshots={snapshots ?? []} />
    </AppShell>
  )
}
