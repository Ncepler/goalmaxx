'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMyGame(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('my_games').insert({
    user_id: user.id,
    sport: formData.get('sport') as string,
    scheduled_for: formData.get('scheduled_for') as string,
    location: (formData.get('location') as string) || null,
    opponent: (formData.get('opponent') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath('/sports/my-games')
}

export async function updateGameResult(id: string, result: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('my_games').update({ result, notes: notes ?? null }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/sports/my-games')
}
