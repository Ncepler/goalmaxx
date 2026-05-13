'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function createAssignment(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('school_assignments').insert({
    user_id: USER_ID,
    subject_id: formData.get('subject_id') as string,
    title: (formData.get('title') as string).trim(),
    due_date: (formData.get('due_date') as string) || null,
    length: (formData.get('length') as string) || null,
    fun: formData.get('fun') === 'true',
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath('/school')
}

export async function toggleAssignment(id: string, completed: boolean) {
  const supabase = createAdminClient()

  await supabase
    .from('school_assignments')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/school')
}

export async function deleteAssignment(id: string) {
  const supabase = createAdminClient()

  await supabase.from('school_assignments').delete().eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/school')
}

export async function createLink(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('school_links').insert({
    user_id: USER_ID,
    subject_id: formData.get('subject_id') as string,
    label: (formData.get('label') as string).trim(),
    url: (formData.get('url') as string).trim(),
    icon: (formData.get('icon') as string) || null,
  })
  revalidatePath('/school')
}

export async function deleteLink(id: string, slug: string) {
  const supabase = createAdminClient()

  await supabase.from('school_links').delete().eq('id', id).eq('user_id', USER_ID)
  revalidatePath(`/school/${slug}`)
}

export async function updateNotes(subjectId: string, notesMd: string) {
  const supabase = createAdminClient()

  await supabase
    .from('school_subjects')
    .update({ notes_md: notesMd })
    .eq('id', subjectId).eq('user_id', USER_ID)
  revalidatePath('/school')
}
