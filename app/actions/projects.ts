'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = createAdminClient()

  const name = (formData.get('name') as string).trim()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await supabase.from('projects').insert({
    user_id: USER_ID,
    slug,
    name,
    tagline: (formData.get('tagline') as string) || null,
    status: (formData.get('status') as string) || 'active',
    github_repo: (formData.get('github_repo') as string) || null,
    live_url: (formData.get('live_url') as string) || null,
  })
  revalidatePath('/projects')
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = createAdminClient()

  await supabase.from('projects').update({ status }).eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/projects')
}

export async function createProjectTask(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('project_tasks').insert({
    user_id: USER_ID,
    project_id: formData.get('project_id') as string,
    title: (formData.get('title') as string).trim(),
  })
  revalidatePath('/projects')
}

export async function toggleProjectTask(id: string, completed: boolean) {
  const supabase = createAdminClient()

  await supabase.from('project_tasks').update({
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/projects')
}

export async function updateProjectNotes(id: string, notesMd: string) {
  const supabase = createAdminClient()

  await supabase.from('projects').update({ notes_md: notesMd }).eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/projects')
}
