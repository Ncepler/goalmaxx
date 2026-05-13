'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function addMyGame(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('my_games').insert({
    user_id: USER_ID,
    sport: formData.get('sport') as string,
    scheduled_for: formData.get('scheduled_for') as string,
    location: (formData.get('location') as string) || null,
    opponent: (formData.get('opponent') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath('/sports/my-games')
}

export async function updateGameResult(id: string, result: string, notes?: string) {
  const supabase = createAdminClient()

  await supabase.from('my_games').update({ result, notes: notes ?? null }).eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/sports/my-games')
}
