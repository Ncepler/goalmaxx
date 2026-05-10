'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function logHydration(source: 'cup' | 'bottle' | 'gatorade', ml: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('hydration_logs').insert({
    user_id: user.id,
    date: format(new Date(), 'yyyy-MM-dd'),
    source,
    ml,
  })

  revalidatePath('/main')
}

export async function removeHydration(source: 'cup' | 'bottle' | 'gatorade', date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Delete the most recent log for this source on this date
  const { data: logs } = await supabase
    .from('hydration_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .eq('source', source)
    .order('logged_at', { ascending: false })
    .limit(1)

  if (logs?.length) {
    await supabase
      .from('hydration_logs')
      .delete()
      .eq('id', logs[0].id)
  }

  revalidatePath('/main')
}
