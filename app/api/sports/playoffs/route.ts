import { NextResponse } from 'next/server'

const LEAGUES = [
  { league: 'nhl', sport: 'hockey' },
  { league: 'nba', sport: 'basketball' },
  { league: 'mlb', sport: 'baseball' },
  { league: 'nfl', sport: 'football' },
]

export async function GET() {
  try {
    const results = await Promise.allSettled(
      LEAGUES.map(async ({ league, sport }) => {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`,
          { next: { revalidate: 300 } }
        )
        if (!res.ok) return { league, events: [] }
        const data = await res.json()
        return { league, events: data.events ?? [] }
      })
    )

    const combined = results
      .filter((r): r is PromiseFulfilledResult<{ league: string; events: unknown[] }> => r.status === 'fulfilled')
      .flatMap(r => r.value.events.map((e: unknown) => ({ ...e as object, _league: r.value.league })))

    return NextResponse.json({ events: combined })
  } catch {
    return NextResponse.json({ events: [] })
  }
}
