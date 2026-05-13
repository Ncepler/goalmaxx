'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSatTest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('sat_tests').insert({
    user_id: user.id,
    scheduled_for: formData.get('scheduled_for') as string,
    is_practice: formData.get('is_practice') === 'true',
    source_url: (formData.get('source_url') as string) || null,
  })
  revalidatePath('/sat')
}

export async function logSatScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const rwScore = Number(formData.get('rw_score'))
  const mathScore = Number(formData.get('math_score'))

  await supabase.from('sat_tests').update({
    rw_score: rwScore,
    math_score: mathScore,
    total_score: rwScore + mathScore,
    taken_at: new Date().toISOString(),
    notes: (formData.get('notes') as string) || null,
  }).eq('id', formData.get('id') as string).eq('user_id', user.id)

  revalidatePath('/sat')
}

// Log a score directly without pre-scheduling
export async function logScoreDirect(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const rwScore = Number(formData.get('rw_score'))
  const mathScore = Number(formData.get('math_score'))
  const date = formData.get('date') as string
  const isPractice = formData.get('is_practice') === 'true'

  await supabase.from('sat_tests').insert({
    user_id: user.id,
    scheduled_for: date + 'T08:00:00',
    taken_at: date + 'T08:00:00',
    is_practice: isPractice,
    rw_score: rwScore,
    math_score: mathScore,
    total_score: rwScore + mathScore,
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath('/sat')
}

export async function deleteSatTest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('sat_tests').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/sat')
}

export async function addExamDate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('exam_dates').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    type: formData.get('type') as 'sat' | 'ap' | 'final',
    date: formData.get('date') as string,
  })
  revalidatePath('/sat')
}

export async function deleteExamDate(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('exam_dates').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/sat')
}
