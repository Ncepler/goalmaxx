'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('profiles').update({
    display_name: (formData.get('display_name') as string) || null,
    water_target_ml: Number(formData.get('water_target_ml') || 3000),
    cup_size_ml: Number(formData.get('cup_size_ml') || 500),
    bottle_size_ml: Number(formData.get('bottle_size_ml') || 500),
    gatorade_size_ml: Number(formData.get('gatorade_size_ml') || 591),
    focus_target_minutes: Number(formData.get('focus_target_minutes') || 240),
    bedtime_target: (formData.get('bedtime_target') as string) || '23:00',
  }).eq('id', USER_ID)

  revalidatePath('/settings')
  revalidatePath('/main')
}
