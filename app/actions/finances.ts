'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function createSubscription(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('subscriptions').insert({
    user_id: USER_ID,
    service: (formData.get('service') as string).trim(),
    cost: Number(formData.get('cost')),
    currency: (formData.get('currency') as string) || 'USD',
    cadence: formData.get('cadence') as string,
    next_charge_date: (formData.get('next_charge_date') as string) || null,
  })
  revalidatePath('/finances')
}

export async function deleteSubscription(id: string) {
  const supabase = createAdminClient()

  await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/finances')
}

export async function createOrder(formData: FormData) {
  const supabase = createAdminClient()

  await supabase.from('incoming_orders').insert({
    user_id: USER_ID,
    source: (formData.get('source') as string).trim(),
    amount: Number(formData.get('amount')),
    currency: (formData.get('currency') as string) || 'USD',
    expected_date: (formData.get('expected_date') as string) || null,
    status: 'pending',
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath('/finances')
}

export async function updateOrderStatus(id: string, status: 'pending' | 'received' | 'overdue') {
  const supabase = createAdminClient()

  await supabase.from('incoming_orders').update({
    status,
    received_at: status === 'received' ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', USER_ID)
  revalidatePath('/finances')
}
