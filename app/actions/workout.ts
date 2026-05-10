'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function createExercise(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('exercises').insert({
    user_id: user.id,
    name: (formData.get('name') as string).trim(),
    muscle_group: (formData.get('muscle_group') as string) || null,
    rep_range_low: Number(formData.get('rep_range_low') || 6),
    rep_range_high: Number(formData.get('rep_range_high') || 8),
    weight_increment_kg: Number(formData.get('weight_increment_kg') || 2.5),
  })
  revalidatePath('/workout')
}

export async function getOrCreateTodaySession(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id, date: today })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function logSet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const sessionId = formData.get('session_id') as string
  const exerciseId = formData.get('exercise_id') as string
  const weightKg = Number(formData.get('weight_kg'))
  const reps = Number(formData.get('reps'))
  const setOrder = Number(formData.get('set_order') || 1)

  await supabase.from('sets').insert({
    user_id: user.id,
    session_id: sessionId,
    exercise_id: exerciseId,
    weight_kg: weightKg,
    reps,
    set_order: setOrder,
  })
  revalidatePath('/workout')
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('exercises').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/workout')
}
