'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function addAccount(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('brand_accounts').insert({
    user_id: USER_ID,
    platform: formData.get('platform') as string,
    handle: (formData.get('handle') as string).trim(),
    display_name: (formData.get('display_name') as string) || null,
  })
  revalidatePath('/brand')
}

export async function logSnapshot(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('brand_snapshots').insert({
    user_id: USER_ID,
    account_id: formData.get('account_id') as string,
    date: format(new Date(), 'yyyy-MM-dd'),
    followers: Number(formData.get('followers') || 0),
    views_total: Number(formData.get('views_total') || 0) || null,
    engagement: Number(formData.get('engagement') || 0) || null,
  })
  revalidatePath('/brand')
}
