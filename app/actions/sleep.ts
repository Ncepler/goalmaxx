'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function startSleep() {
  const supabase = createAdminClient()

  await supabase.from('sleep_logs').insert({
    user_id: USER_ID,
    sleep_start: new Date().toISOString(),
    source: 'manual',
  })

  revalidatePath('/main')
}

export async function endSleep(sleepLogId: string) {
  const supabase = createAdminClient()

  const { data: log } = await supabase
    .from('sleep_logs')
    .select('sleep_start')
    .eq('id', sleepLogId)
    .eq('user_id', USER_ID)
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
    .eq('user_id', USER_ID)

  revalidatePath('/main')
}
