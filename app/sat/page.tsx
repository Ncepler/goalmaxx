'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { addSatTest, logSatScore, deleteSatTest } from '@/app/actions/sat'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Database } from '@/lib/types'

type SatTest = Database['public']['Tables']['sat_tests']['Row']

const REAL_TEST_DATES = [
  '2025-08-23',
  '2025-10-04',
  '2025-11-01',
  '2025-12-06',
  '2026-03-14',
  '2026-05-02',
  '2026-06-06',
]

export default function SatPage() {
  const [tests, setTests] = useState<SatTest[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('sat_tests')
      .select('*')
      .order('scheduled_for', { ascending: true })
    setTests(data ?? [])
  }

  useEffect(() => { load() }, [])

  const upcoming = tests.filter(t => !t.taken_at)
  const completed = tests.filter(t => t.taken_at).sort((a, b) =>
    new Date(a.taken_at!).getTime() - new Date(b.taken_at!).getTime()
  )

  const nextRealTest = REAL_TEST_DATES
    .map(d => parseISO(d))
    .filter(d => d > new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0]

  const daysUntil = nextRealTest ? differenceInDays(nextRealTest, new Date()) : null

  const chartData = completed
    .filter(t => t.total_score)
    .map(t => ({
      date: format(parseISO(t.taken_at!), 'MMM d'),
      score: t.total_score,
      rw: t.rw_score,
      math: t.math_score,
    }))

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addSatTest(formData)
      await load()
      setShowAdd(false)
    })
  }

  async function handleScore(formData: FormData) {
    startTransition(async () => {
      await logSatScore(formData)
      await load()
      setScoringId(null)
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSatTest(id)
      await load()
    })
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <SectionHeader title="SAT PREP" className="mb-1" />
            {daysUntil !== null && (
              <p className="text-text-tertiary text-xs">
                Next real test: <span className="text-gold font-bold">{daysUntil}d</span>{' '}
                ({format(nextRealTest!, 'MMM d, yyyy')})
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150"
          >
            <Plus size={14} />
            Schedule test
          </button>
        </div>

        {showAdd && (
          <form action={handleAdd} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
            <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">Schedule a test</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date & Time</label>
                <input name="scheduled_for" type="datetime-local" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select name="is_practice" className={inputCls}>
                  <option value="true">Practice test</option>
                  <option value="false">Real SAT</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Source URL (practice tests)</label>
              <input name="source_url" type="url" placeholder="CollegeBoard link..." className={inputCls} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className={btnGold}>Schedule</button>
              <button type="button" onClick={() => setShowAdd(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <SectionHeader title="UPCOMING" />
            <div className="space-y-2">
              {upcoming.map(t => (
                <div key={t.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {t.is_practice ? 'Practice test' : 'Real SAT'}
                      </p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {format(parseISO(t.scheduled_for), 'EEE, MMM d · h:mm a')}
                      </p>
                      {t.source_url && (
                        <a href={t.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-gold hover:text-gold-bright transition-colors duration-150 mt-1 block">
                          Open test →
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {t.is_practice && (
                        <button
                          onClick={() => setScoringId(t.id)}
                          className="text-xs text-gold border border-gold/30 rounded-full px-2 py-0.5 hover:bg-gold/10 transition-colors duration-150"
                        >
                          Log score
                        </button>
                      )}
                      <button onClick={() => handleDelete(t.id)} className="text-text-tertiary hover:text-danger transition-colors duration-150">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {scoringId === t.id && (
                    <form action={handleScore} className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                      <input type="hidden" name="id" value={t.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>R/W Score</label>
                          <input name="rw_score" type="number" min={200} max={800} step={10} placeholder="200–800" required className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Math Score</label>
                          <input name="math_score" type="number" min={200} max={800} step={10} placeholder="200–800" required className={inputCls} />
                        </div>
                      </div>
                      <input name="notes" placeholder="Notes (what went wrong)" className={inputCls} />
                      <div className="flex gap-2">
                        <button type="submit" className={btnGold}>Save score</button>
                        <button type="button" onClick={() => setScoringId(null)} className={btnGhost}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Trend chart */}
        {chartData.length >= 2 && (
          <>
            <SectionHeader title="SCORE TREND" />
            <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-text-secondary" />
                <span className="text-xs text-text-secondary">
                  {chartData.length} practice test{chartData.length !== 1 ? 's' : ''} logged
                </span>
                {completed.length > 0 && completed[completed.length - 1].total_score && (
                  <span className="ml-auto text-gold font-bold text-lg tabular-nums">
                    {completed[completed.length - 1].total_score}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[800, 1600]} tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8a8a85' }}
                    itemStyle={{ color: '#d4a85a' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#d4a85a" strokeWidth={2} dot={{ fill: '#d4a85a', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* History */}
        {completed.length > 0 && (
          <>
            <SectionHeader title="HISTORY" />
            <div className="space-y-2">
              {[...completed].reverse().map(t => (
                <div key={t.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-text-primary text-sm font-medium">
                      {t.is_practice ? 'Practice' : 'Real SAT'} — {format(parseISO(t.taken_at!), 'MMM d, yyyy')}
                    </p>
                    {t.notes && <p className="text-xs text-text-tertiary mt-0.5">{t.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gold font-bold text-xl tabular-nums">{t.total_score}</p>
                    <p className="text-text-tertiary text-xs">{t.rw_score} / {t.math_score}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tests.length === 0 && (
          <p className="text-text-tertiary text-sm">No tests scheduled yet.</p>
        )}

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
          <SectionHeader title="OFFICIAL TEST DATES" />
          <div className="space-y-1.5">
            {REAL_TEST_DATES.map(d => {
              const date = parseISO(d)
              const past = date < new Date()
              return (
                <div key={d} className={`flex justify-between text-sm ${past ? 'text-text-tertiary opacity-50' : 'text-text-secondary'}`}>
                  <span>{format(date, 'MMMM d, yyyy')}</span>
                  {!past && <span className="text-text-tertiary text-xs">{differenceInDays(date, new Date())}d away</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
