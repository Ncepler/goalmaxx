import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SPORT_MAP: Record<string, string> = {
  nhl: 'hockey',
  mlb: 'baseball',
  nfl: 'football',
  nba: 'basketball',
}

export async function GET(request: Request, { params }: { params: Promise<{ league: string }> }) {
  const { league } = await params
  const cacheKey = `scoreboard:${league}`
  const supabase = await createClient()

  const { data: cached } = await supabase
    .from('sports_cache')
    .select('payload, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return NextResponse.json(cached.payload)
  }

  const sport = SPORT_MAP[league]
  if (!sport) return NextResponse.json({ error: 'Unknown league' }, { status: 404 })

  const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`

  try {
    const res = await fetch(espnUrl)
    if (!res.ok) throw new Error('ESPN fetch failed')
    const data = await res.json()

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    await supabase.from('sports_cache').upsert({ cache_key: cacheKey, payload: data, expires_at: expiresAt })

    return NextResponse.json(data)
  } catch {
    if (cached) return NextResponse.json(cached.payload)
    return NextResponse.json({ error: 'Failed to fetch scoreboard' }, { status: 502 })
  }
}
