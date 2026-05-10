'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format, addDays } from 'date-fns'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const title = formData.get('title') as string
  const dueDate = formData.get('due_date') as string
  const estMinutes = formData.get('est_minutes') ? Number(formData.get('est_minutes')) : null
  const priority = formData.get('priority') ? Number(formData.get('priority')) : 0

  if (!title?.trim()) return

  await supabase.from('tasks').insert({
    user_id: user.id,
    title: title.trim(),
    due_date: dueDate || format(new Date(), 'yyyy-MM-dd'),
    est_minutes: estMinutes,
    priority,
  })

  revalidatePath('/main')
}

export async function toggleTask(id: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tasks')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/main')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/main')
}

export async function pushIncompleteToTomorrow(today: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const tomorrow = format(addDays(new Date(today + 'T12:00:00'), 1), 'yyyy-MM-dd')

  const { data: incompleteTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', user.id)
    .eq('due_date', today)
    .eq('completed', false)

  if (!incompleteTasks?.length) return

  for (const task of incompleteTasks) {
    await supabase
      .from('tasks')
      .update({ due_date: tomorrow, rolled_from_date: today })
      .eq('id', task.id)
  }

  revalidatePath('/main')
}

export async function updateTaskNotes(id: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('tasks')
    .update({ notes })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/main')
}
