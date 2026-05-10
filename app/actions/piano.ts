'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSong(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('piano_songs').insert({
    user_id: user.id,
    title: (formData.get('title') as string).trim(),
    artist: (formData.get('artist') as string) || null,
    tiktok_url: (formData.get('tiktok_url') as string) || null,
    status: 'want',
  })
  revalidatePath('/piano')
}

export async function setSongStatus(id: string, status: 'want' | 'learning' | 'learned') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (status === 'learning') {
    // Clear any existing current song
    await supabase.from('piano_songs').update({ is_current: false }).eq('user_id', user.id)
  }

  await supabase.from('piano_songs').update({
    status,
    is_current: status === 'learning',
    learned_at: status === 'learned' ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', user.id)

  revalidatePath('/piano')
}

export async function deleteSong(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('piano_songs').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/piano')
}
