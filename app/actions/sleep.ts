'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startSleep() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('sleep_logs').insert({
    user_id: user.id,
    sleep_start: new Date().toISOString(),
    source: 'manual',
  })

  revalidatePath('/main')
}

export async function endSleep(sleepLogId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: log } = await supabase
    .from('sleep_logs')
    .select('sleep_start')
    .eq('id', sleepLogId)
    .eq('user_id', user.id)
    .single()

  if (!log) return

  const sleepEnd = new Date()
  const sleepStart = new Date(log.sleep_start)
  const durationMinutes = Math.round((sleepEnd.getTime() - sleepStart.getTime()) / 60000)

  await supabase
    .from('sleep_logs')
    .update({
      sleep_end: sleepEnd.toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq('id', sleepLogId)
    .eq('user_id', user.id)

  revalidatePath('/main')
}
