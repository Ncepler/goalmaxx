'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function createWebClient(fd: FormData) {
  const supabase = createAdminClient()
  await supabase.from('web_clients').insert({
    user_id: USER_ID,
    company: fd.get('company') as string,
    flat_fee: fd.get('flat_fee') ? Number(fd.get('flat_fee')) : null,
    annual_fee: fd.get('annual_fee') ? Number(fd.get('annual_fee')) : null,
    annual_date: (fd.get('annual_date') as string) || null,
    notes: (fd.get('notes') as string) || null,
  })
  revalidatePath('/finances')
}

export async function deleteWebClient(id: string) {
  const supabase = createAdminClient()
  await supabase.from('web_clients').delete().eq('id', id)
  revalidatePath('/finances')
}

export async function updateWebClient(id: string, fd: FormData) {
  const supabase = createAdminClient()
  await supabase.from('web_clients').update({
    company: fd.get('company') as string,
    flat_fee: fd.get('flat_fee') ? Number(fd.get('flat_fee')) : null,
    annual_fee: fd.get('annual_fee') ? Number(fd.get('annual_fee')) : null,
    annual_date: (fd.get('annual_date') as string) || null,
    notes: (fd.get('notes') as string) || null,
  }).eq('id', id)
  revalidatePath('/finances')
}
