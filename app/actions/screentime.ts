'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function logScreenTime(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const date = format(new Date(), 'yyyy-MM-dd')

  await supabase.from('screen_time_logs').upsert({
    user_id: user.id,
    date,
    total_minutes: Number(formData.get('total_minutes') || 0),
    social_minutes: Number(formData.get('social_minutes') || 0),
    productive_minutes: Number(formData.get('productive_minutes') || 0),
    source: 'manual',
  }, { onConflict: 'user_id,date' })

  revalidatePath('/screen-time')
}
