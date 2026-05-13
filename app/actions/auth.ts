'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

const NOAH_EMAIL = 'noahtcepler@gmail.com'
const PIN = '3434'

export async function pinLogin(pin: string) {
  if (pin !== PIN) {
    return { error: 'Wrong PIN' }
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: NOAH_EMAIL,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback` },
  })

  if (error || !data.properties?.action_link) {
    return { error: 'Login failed, try again' }
  }

  redirect(data.properties.action_link)
}
