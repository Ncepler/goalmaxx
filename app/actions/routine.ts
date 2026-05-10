'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { buildSchedule, type RoutineItem } from '@/lib/routine-algorithm'

export async function saveRoutinePlan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const itemsJson = formData.get('items') as string
  const items: RoutineItem[] = JSON.parse(itemsJson)
  const bedtime = formData.get('bedtime') as string
  const date = format(new Date(), 'yyyy-MM-dd')

  const generatedSchedule = buildSchedule(items, bedtime)

  const { data: existing } = await supabase
    .from('routine_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  if (existing) {
    await supabase.from('routine_plans').update({
      items: items as unknown as import('@/lib/types').Json,
      bedtime,
      generated_schedule: generatedSchedule as unknown as import('@/lib/types').Json,
    }).eq('id', existing.id)
  } else {
    await supabase.from('routine_plans').insert({
      user_id: user.id,
      date,
      bedtime,
      items: items as unknown as import('@/lib/types').Json,
      generated_schedule: generatedSchedule as unknown as import('@/lib/types').Json,
    })
  }
  revalidatePath('/routine')
}

export async function importHomeworkAsItems(date: string): Promise<RoutineItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: assignments } = await supabase
    .from('school_assignments')
    .select('*, school_subjects(name)')
    .eq('user_id', user.id)
    .eq('completed', false)
    .or(`due_date.eq.${date},due_date.is.null`)

  if (!assignments) return []

  const durationMap = { short: 20, medium: 35, long: 60 }

  return assignments.map(a => ({
    type: 'homework' as const,
    title: a.title,
    duration_min: durationMap[(a.length as keyof typeof durationMap) ?? 'medium'] ?? 35,
    priority: a.length === 'long' && !a.fun ? 'high' : a.length === 'short' ? 'low' : 'med',
    fun: a.fun ?? false,
    length: a.length ?? 'medium',
    className: (a.school_subjects as { name?: string } | null)?.name ?? '',
    hard_time: null,
    notes: a.notes ?? '',
  }))
}
