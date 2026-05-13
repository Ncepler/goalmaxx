'use client'

import { useEffect, useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { addMyGame, updateGameResult } from '@/app/actions/sports'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'

interface Team {
  id: string
  name: string
  league: string
  sport: string
  espnLeague: string
}

interface MyGame {
  id: string
  sport: string
  scheduled_for: string
  location: string | null
  opponent: string | null
  result: string | null
  notes: string | null
}

interface TeamData {
  record?: string
  isLoading?: boolean
  error?: boolean
}

interface PlayoffEvent {
  id: string
  name: string
  _league: string
  status?: { type?: { name?: string; shortDetail?: string; state?: string } }
  competitions?: Array<{
    competitors: Array<{ team: { displayName: string }; score: string; homeAway: string }>
  }>
}

const TABS = ['MY TEAMS', 'PLAYOFF WATCH', 'MY GAMES'] as const
type Tab = typeof TABS[number]

export function SportsClient({ teams, myGames: initialGames }: { teams: Team[]; myGames: MyGame[] }) {
  const [tab, setTab] = useState<Tab>('MY TEAMS')
  const [teamData, setTeamData] = useState<Record<string, TeamData>>({})
  const [playoffs, setPlayoffs] = useState<PlayoffEvent[]>([])
  const [playoffsLoading, setPlayoffsLoading] = useState(false)
  const [myGames, setMyGames] = useState<MyGame[]>(initialGames)
  const [showAddGame, setShowAddGame] = useState(false)
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function fetchTeams() {
    for (const team of teams) {
      setTeamData(prev => ({ ...prev, [team.id]: { ...prev[team.id], isLoading: true } }))
      try {
        const res = await fetch(`/api/sports/teams/${team.id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        const record = data?.team?.record?.items?.[0]?.summary ?? null
        setTeamData(prev => ({ ...prev, [team.id]: { record, isLoading: false } }))
      } catch {
        setTeamData(prev => ({ ...prev, [team.id]: { isLoading: false, error: true } }))
      }
    }
  }

  async function fetchPlayoffs() {
    setPlayoffsLoading(true)
    try {
      const res = await fetch('/api/sports/playoffs')
      const data = await res.json()
      setPlayoffs(data.events ?? [])
    } catch {
      setPlayoffs([])
    } finally {
      setPlayoffsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
    const interval = setInterval(fetchTeams, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (tab === 'PLAYOFF WATCH') fetchPlayoffs()
  }, [tab])

  function handleAddGame(fd: FormData) {
    startTransition(async () => {
      await addMyGame(fd)
      router.refresh()
      setShowAddGame(false)
    })
  }

  function handleResult(id: string, result: string) {
    startTransition(async () => { await updateGameResult(id, result); router.refresh() })
  }

  const filteredPlayoffs = leagueFilter === 'all'
    ? playoffs
    : playoffs.filter(e => e._league === leagueFilter)

  const MY_TEAM_ESPN_IDS = ['islanders', 'mets', 'giants', 'knicks']

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-elevated border border-border-subtle rounded-lg p-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-colors duration-150 ${tab === t ? 'bg-bg-input text-gold' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'MY TEAMS' && (
        <>
          <div className="flex justify-end">
            <button onClick={fetchTeams} className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors duration-150">
              <RefreshCw size={10} /> Refresh
            </button>
          </div>
          <div className="space-y-3">
            {teams.map(team => {
              const d = teamData[team.id]
              return (
                <div key={team.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">{team.league}</p>
                      <p className="text-gold font-bold text-lg mt-0.5">{team.name}</p>
                    </div>
                    <div className="text-right">
                      {d?.isLoading && <p className="text-text-tertiary text-xs">Loading…</p>}
                      {d?.error && <p className="text-text-tertiary text-xs">ESPN unavailable</p>}
                      {d?.record && !d?.isLoading && (
                        <p className="text-text-primary font-bold text-xl tabular-nums">{d.record}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'PLAYOFF WATCH' && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'nhl', 'nba', 'mlb', 'nfl'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLeagueFilter(l)}
                className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider transition-colors duration-150 ${leagueFilter === l ? 'bg-gold text-bg-base font-bold' : 'border border-border-subtle text-text-secondary hover:border-border-strong'}`}
              >
                {l}
              </button>
            ))}
            <button onClick={fetchPlayoffs} className="ml-auto text-[10px] text-text-tertiary hover:text-text-secondary transition-colors duration-150 flex items-center gap-1">
              <RefreshCw size={10} /> Refresh
            </button>
          </div>

          {playoffsLoading && <p className="text-text-tertiary text-sm">Loading games…</p>}

          {!playoffsLoading && filteredPlayoffs.length === 0 && (
            <p className="text-text-tertiary text-sm">No playoff games found. May be off-season for NHL/NBA.</p>
          )}

          <div className="space-y-2">
            {filteredPlayoffs.map(event => {
              const comp = event.competitions?.[0]
              const status = event.status?.type?.shortDetail ?? ''
              const state = event.status?.type?.state ?? ''
              const isLive = state === 'in'
              const isFinal = state === 'post'
              const competitors = comp?.competitors ?? []
              const home = competitors.find((c: { homeAway: string }) => c.homeAway === 'home')
              const away = competitors.find((c: { homeAway: string }) => c.homeAway === 'away')
              const homeScore = parseInt(home?.score ?? '0')
              const awayScore = parseInt(away?.score ?? '0')
              const isMyTeam = MY_TEAM_ESPN_IDS.some(id =>
                event.name?.toLowerCase().includes(id.toLowerCase()) ||
                competitors.some((c: { team?: { displayName?: string } }) => c.team?.displayName?.toLowerCase().includes(id.toLowerCase()))
              )
              return (
                <div key={event.id} className={`rounded-xl border p-4 ${isMyTeam ? 'bg-gold/5 border-gold/30' : 'bg-bg-elevated border-border-subtle'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium tracking-[0.12em] text-text-tertiary uppercase">{event._league}</span>
                    {isMyTeam && <span className="text-[10px] text-gold">★ your team</span>}
                    {isLive && <span className="text-[10px] bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-medium">LIVE</span>}
                    {isFinal && <span className="text-[10px] text-text-tertiary">Final</span>}
                    {!isLive && !isFinal && <span className="text-[10px] text-text-tertiary">{status}</span>}
                  </div>

                  {(isLive || isFinal) && home && away ? (
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 text-sm font-medium ${isFinal && awayScore > homeScore ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                        {away.team?.displayName}
                      </div>
                      <div className="text-gold font-bold text-lg tabular-nums">
                        {awayScore} – {homeScore}
                      </div>
                      <div className={`flex-1 text-right text-sm font-medium ${isFinal && homeScore > awayScore ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                        {home.team?.displayName}
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">{event.name}</p>
                  )}

                  {isFinal && home && away && (homeScore !== awayScore) && (
                    <p className="text-[11px] text-success mt-1.5">
                      {homeScore > awayScore ? (home.team?.displayName ?? 'Home') : (away.team?.displayName ?? 'Away')} wins
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'MY GAMES' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowAddGame(v => !v)} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150">
              <Plus size={14} /> Log game
            </button>
          </div>

          {showAddGame && (
            <form action={handleAddGame} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Sport</label>
                  <input name="sport" placeholder="Basketball, Soccer…" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date & Time</label>
                  <input name="scheduled_for" type="datetime-local" required className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="opponent" placeholder="Opponent" className={inputCls} />
                <input name="location" placeholder="Location" className={inputCls} />
              </div>
              <input name="notes" placeholder="Notes" className={inputCls} />
              <div className="flex gap-2">
                <button type="submit" className={btnGold}>Log</button>
                <button type="button" onClick={() => setShowAddGame(false)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {myGames.map(g => (
              <div key={g.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{g.sport}</p>
                    <p className="text-text-tertiary text-xs">{format(parseISO(g.scheduled_for), 'EEE, MMM d · h:mm a')}</p>
                    {g.opponent && <p className="text-text-secondary text-xs mt-0.5">vs {g.opponent}</p>}
                    {g.location && <p className="text-text-tertiary text-xs">{g.location}</p>}
                    {g.notes && <p className="text-text-secondary text-xs mt-1 italic">{g.notes}</p>}
                  </div>
                  <div className="shrink-0 flex gap-1">
                    {(['W', 'L', 'T'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => handleResult(g.id, r)}
                        className={`text-xs px-1.5 py-0.5 rounded-full transition-colors duration-150 ${
                          g.result === r
                            ? r === 'W' ? 'bg-success/20 text-success' : r === 'L' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                            : 'border border-border-subtle text-text-tertiary hover:border-border-strong'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {myGames.length === 0 && <p className="text-text-tertiary text-sm">No games logged yet.</p>}
          </div>
        </>
      )}
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
