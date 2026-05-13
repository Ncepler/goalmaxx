import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { AppShell } from '@/components/nav/AppShell'
import { SportsClient } from '@/components/sports/SportsClient'

export const revalidate = 0

const TEAMS = [
  { id: 'islanders', name: 'NY Islanders', league: 'NHL', sport: 'hockey', espnLeague: 'nhl' },
  { id: 'mets', name: 'NY Mets', league: 'MLB', sport: 'baseball', espnLeague: 'mlb' },
  { id: 'giants', name: 'NY Giants', league: 'NFL', sport: 'football', espnLeague: 'nfl' },
  { id: 'knicks', name: 'NY Knicks', league: 'NBA', sport: 'basketball', espnLeague: 'nba' },
]

export default async function SportsPage() {
  const supabase = createAdminClient()

  const { data: myGames } = await supabase
    .from('my_games')
    .select('*')
    .eq('user_id', USER_ID)
    .order('scheduled_for', { ascending: false })

  return (
    <AppShell>
      <SportsClient teams={TEAMS} myGames={myGames ?? []} />
    </AppShell>
  )
}
