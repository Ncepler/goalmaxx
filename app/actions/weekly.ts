'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { startOfWeek, format } from 'date-fns'

export async function saveWeeklyReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { data: existing } = await supabase
    .from('weekly_reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .single()

  const payload = {
    user_id: user.id,
    week_start: weekStart,
    worked_md: formData.get('worked_md') as string,
    didnt_work_md: formData.get('didnt_work_md') as string,
    next_week_focus_md: formData.get('next_week_focus_md') as string,
  }

  if (existing) {
    await supabase.from('weekly_reviews').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('weekly_reviews').insert(payload)
  }
  revalidatePath('/weekly')
}
