'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startFocus(unlockConditions?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('focus_sessions').insert({
    user_id: user.id,
    started_at: new Date().toISOString(),
    unlock_conditions: unlockConditions ? { text: unlockConditions } : null,
  })

  revalidatePath('/main')
}

export async function endFocus(sessionId: string, broken = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('focus_sessions')
    .update({
      ended_at: new Date().toISOString(),
      broken,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  revalidatePath('/main')
}
