import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const token = request.headers.get('x-shortcut-token')
  const expectedToken = process.env.SHORTCUT_TOKEN

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { date, steps, sleep_minutes, screen_time_minutes, social_minutes } = body

  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const supabase = await createClient()

  // Find user by shortcut_token
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('shortcut_token', token)
    .single()

  if (!profile) return NextResponse.json({ error: 'No matching profile' }, { status: 404 })

  await supabase.from('health_data').upsert({
    user_id: profile.id,
    date,
    steps: steps ?? null,
    sleep_minutes: sleep_minutes ?? null,
    screen_time_minutes: screen_time_minutes ?? null,
    social_minutes: social_minutes ?? null,
    raw_payload: body,
  }, { onConflict: 'user_id,date' })

  // Also upsert screen_time_logs from shortcut data
  if (screen_time_minutes !== undefined) {
    await supabase.from('screen_time_logs').upsert({
      user_id: profile.id,
      date,
      total_minutes: screen_time_minutes,
      social_minutes: social_minutes ?? null,
      source: 'shortcut',
    }, { onConflict: 'user_id,date' })
  }

  return NextResponse.json({ ok: true })
}
