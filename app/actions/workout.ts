'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function createExercise(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('exercises').insert({
    user_id: USER_ID,
    name: (formData.get('name') as string).trim(),
    muscle_group: (formData.get('muscle_group') as string) || null,
    rep_range_low: Number(formData.get('rep_range_low') || 6),
    rep_range_high: Number(formData.get('rep_range_high') || 8),
    weight_increment_kg: Number(formData.get('weight_increment_kg') || 2.5),
  })
  revalidatePath('/workout')
}

export async function getOrCreateTodaySession(): Promise<string | null> {
  const supabase = createAdminClient()

  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', USER_ID)
    .eq('date', today)
    .single()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('workout_sessions')
    .insert({ user_id: USER_ID, date: today })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function logSet(formData: FormData) {
  const supabase = createAdminClient()

  const sessionId = formData.get('session_id') as string
  const exerciseId = formData.get('exercise_id') as string
  const weightKg = Number(formData.get('weight_kg'))
  const reps = Number(formData.get('reps'))
  const setOrder = Number(formData.get('set_order') || 1)

  await supabase.from('sets').insert({
    user_id: USER_ID,
    session_id: sessionId,
    exercise_id: exerciseId,
    weight_kg: weightKg,
    reps,
    set_order: setOrder,
  })
  revalidatePath('/workout')
}

export async function deleteExercise(id: string) {
  const supabase = createAdminClient()

  await supabase.from('exercises').delete().eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/workout')
}
