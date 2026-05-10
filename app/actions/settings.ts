'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({
    display_name: (formData.get('display_name') as string) || null,
    water_target_ml: Number(formData.get('water_target_ml') || 3000),
    cup_size_ml: Number(formData.get('cup_size_ml') || 500),
    bottle_size_ml: Number(formData.get('bottle_size_ml') || 500),
    gatorade_size_ml: Number(formData.get('gatorade_size_ml') || 591),
    focus_target_minutes: Number(formData.get('focus_target_minutes') || 240),
    bedtime_target: (formData.get('bedtime_target') as string) || '23:00',
  }).eq('id', user.id)

  revalidatePath('/settings')
  revalidatePath('/main')
}
