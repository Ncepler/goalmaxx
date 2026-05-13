'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function startFocus(unlockConditions?: string) {
  const supabase = createAdminClient()

  await supabase.from('focus_sessions').insert({
    user_id: USER_ID,
    started_at: new Date().toISOString(),
    unlock_conditions: unlockConditions ? { text: unlockConditions } : null,
  })

  revalidatePath('/main')
}

export async function endFocus(sessionId: string, broken = false) {
  const supabase = createAdminClient()

  await supabase
    .from('focus_sessions')
    .update({
      ended_at: new Date().toISOString(),
      broken,
    })
    .eq('id', sessionId)
    .eq('user_id', USER_ID)

  revalidatePath('/main')
}
