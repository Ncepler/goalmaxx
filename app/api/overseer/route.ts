import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createAdminClient()

  const { message, context } = await request.json()

  // Check if API key is configured
  const { data: profile } = await supabase
    .from('profiles')
    .select('anthropic_api_key')
    .eq('id', USER_ID)
    .single()

  const PLACEHOLDER = 'Overseer is sleeping. Wake him up by enabling the Anthropic API in Settings.'

  // TODO(api): When profile.anthropic_api_key is set, call Anthropic API:
  // const client = new Anthropic({ apiKey: profile.anthropic_api_key })
  // const response = await client.messages.create({
  //   model: 'claude-sonnet-4-6',
  //   max_tokens: 400,
  //   system: `You are the Overseer — Noah's accountability coach...`,
  //   messages: [{ role: 'user', content: `${message}\n\n${JSON.stringify(context)}` }],
  // })
  // const responseText = response.content[0].type === 'text' ? response.content[0].text : PLACEHOLDER

  const hasApiKey = !!profile?.anthropic_api_key
  const responseText = hasApiKey ? PLACEHOLDER : PLACEHOLDER  // swap TODO(api) above

  await supabase.from('overseer_messages').insert({
    user_id: USER_ID,
    message,
    context_snapshot: context,
    response: responseText,
    responded_at: new Date().toISOString(),
  })

  return NextResponse.json({ response: responseText })
}
