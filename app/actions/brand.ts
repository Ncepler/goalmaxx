'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function addAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('brand_accounts').insert({
    user_id: user.id,
    platform: formData.get('platform') as string,
    handle: (formData.get('handle') as string).trim(),
    display_name: (formData.get('display_name') as string) || null,
  })
  revalidatePath('/brand')
}

export async function logSnapshot(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('brand_snapshots').insert({
    user_id: user.id,
    account_id: formData.get('account_id') as string,
    date: format(new Date(), 'yyyy-MM-dd'),
    followers: Number(formData.get('followers') || 0),
    views_total: Number(formData.get('views_total') || 0) || null,
    engagement: Number(formData.get('engagement') || 0) || null,
  })
  revalidatePath('/brand')
}
