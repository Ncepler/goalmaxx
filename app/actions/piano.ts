'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function addSong(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('piano_songs').insert({
    user_id: USER_ID,
    title: (formData.get('title') as string).trim(),
    artist: (formData.get('artist') as string) || null,
    tiktok_url: (formData.get('tiktok_url') as string) || null,
    status: 'want',
  })
  revalidatePath('/piano')
}

export async function setSongStatus(id: string, status: 'want' | 'learning' | 'learned') {
  const supabase = createAdminClient()

  if (status === 'learning') {
    // Clear any existing current song
    await supabase.from('piano_songs').update({ is_current: false }).eq('user_id', USER_ID)
  }

  await supabase.from('piano_songs').update({
    status,
    is_current: status === 'learning',
    learned_at: status === 'learned' ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', USER_ID)

  revalidatePath('/piano')
}

export async function deleteSong(id: string) {
  const supabase = createAdminClient()

  await supabase.from('piano_songs').delete().eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/piano')
}
