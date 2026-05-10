import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const LEAGUE_MAP: Record<string, { sport: string; league: string }> = {
  islanders: { sport: 'hockey', league: 'nhl' },
  mets: { sport: 'baseball', league: 'mlb' },
  giants: { sport: 'football', league: 'nfl' },
  knicks: { sport: 'basketball', league: 'nba' },
}

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const cacheKey = `team:${teamId}`
  const supabase = await createClient()

  // Check cache
  const { data: cached } = await supabase
    .from('sports_cache')
    .select('payload, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return NextResponse.json(cached.payload)
  }

  const mapping = LEAGUE_MAP[teamId]
  if (!mapping) return NextResponse.json({ error: 'Unknown team' }, { status: 404 })

  const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${mapping.sport}/${mapping.league}/teams/${teamId}`

  try {
    const res = await fetch(espnUrl, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('ESPN fetch failed')
    const data = await res.json()

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    await supabase.from('sports_cache').upsert({ cache_key: cacheKey, payload: data, expires_at: expiresAt })

    return NextResponse.json(data)
  } catch {
    if (cached) return NextResponse.json(cached.payload)
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 502 })
  }
}
