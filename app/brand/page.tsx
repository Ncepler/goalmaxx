import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { BrandClient } from '@/components/brand/BrandClient'

export const revalidate = 0

export default async function BrandPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: accounts }, { data: snapshots }] = await Promise.all([
    supabase.from('brand_accounts').select('*').eq('user_id', user.id).order('platform'),
    supabase
      .from('brand_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200),
  ])

  return (
    <AppShell>
      <BrandClient accounts={accounts ?? []} snapshots={snapshots ?? []} />
    </AppShell>
  )
}
