'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  addSatTest,
  logSatScore,
  logScoreDirect,
  deleteSatTest,
  addExamDate,
  deleteExamDate,
} from '@/app/actions/sat'
import { format, differenceInDays, parseISO, isFuture } from 'date-fns'
import { Plus, Trash2, TrendingUp, CalendarDays, BookOpen, GraduationCap, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Database } from '@/lib/types'

type SatTest = Database['public']['Tables']['sat_tests']['Row']
type ExamDate = Database['public']['Tables']['exam_dates']['Row']

const OFFICIAL_SAT_DATES = [
  '2025-08-23',
  '2025-10-04',
  '2025-11-01',
  '2025-12-06',
  '2026-03-14',
  '2026-05-02',
  '2026-06-06',
]

const TYPE_META: Record<ExamDate['type'], { label: string; color: string; icon: React.ReactNode }> = {
  sat: { label: 'SAT', color: 'text-gold border-gold/30 bg-gold/10', icon: <BookOpen size={12} /> },
  ap: { label: 'AP', color: 'text-info border-info/30 bg-info/10', icon: <GraduationCap size={12} /> },
  final: { label: 'Final', color: 'text-warning border-warning/30 bg-warning/10', icon: <CalendarDays size={12} /> },
}

function CountdownCard({ exam, onDelete }: { exam: ExamDate; onDelete: () => void }) {
  const days = differenceInDays(parseISO(exam.date), new Date())
  const meta = TYPE_META[exam.type]
  const urgent = days <= 7

  return (
    <div className={`shrink-0 w-36 rounded-xl bg-bg-elevated border p-4 flex flex-col gap-2 relative group ${urgent ? 'border-warning/40' : 'border-border-subtle'}`}>
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-opacity duration-150"
      >
        <Trash2 size={11} />
      </button>
      <span className={`inline-flex items-center gap-1 text-[10px] font-medium tracking-wide border rounded-full px-1.5 py-0.5 w-fit ${meta.color}`}>
        {meta.icon}
        {meta.label}
      </span>
      <p className="text-text-primary text-xs font-medium leading-tight">{exam.name}</p>
      <div className="mt-auto">
        <p className={`text-2xl font-bold tabular-nums ${urgent ? 'text-warning' : 'text-gold'}`}>{days}</p>
        <p className="text-[10px] text-text-tertiary">days away</p>
        <p className="text-[10px] text-text-tertiary mt-0.5">{format(parseISO(exam.date), 'MMM d')}</p>
      </div>
    </div>
  )
}

export default function SatPage() {
  const [tests, setTests] = useState<SatTest[]>([])
  const [exams, setExams] = useState<ExamDate[]>([])
  const [showAddTest, setShowAddTest] = useState(false)
  const [showLogScore, setShowLogScore] = useState(false)
  const [showAddExam, setShowAddExam] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const supabase = createClient()

  async function load() {
    const [testsRes, examsRes] = await Promise.all([
      supabase.from('sat_tests').select('*').order('scheduled_for', { ascending: true }),
      supabase.from('exam_dates').select('*').order('date', { ascending: true }),
    ])
    setTests(testsRes.data ?? [])
    setExams(examsRes.data ?? [])
  }

  useEffect(() => { load() }, [])

  const upcoming = tests.filter(t => !t.taken_at)
  const completed = tests
    .filter(t => t.taken_at)
    .sort((a, b) => new Date(a.taken_at!).getTime() - new Date(b.taken_at!).getTime())

  // Upcoming exams (user-added + official SAT dates not already in user list)
  const userExamDates = exams.filter(e => isFuture(parseISO(e.date)))
  const upcomingExams = userExamDates.sort((a, b) =>
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  )

  // Chart data: completed tests with scores
  const chartData = completed
    .filter(t => t.total_score)
    .map(t => ({
      date: format(parseISO(t.taken_at!), 'MMM d'),
      dateRaw: t.taken_at!,
      score: t.total_score,
      rw: t.rw_score,
      math: t.math_score,
      label: t.is_practice ? 'Practice' : 'Real SAT',
    }))

  // Reference lines for exam dates on chart
  const chartExamLines = upcomingExams.slice(0, 5).map(e => ({
    date: format(parseISO(e.date), 'MMM d'),
    name: e.name,
    type: e.type,
  }))

  async function handleAddTest(formData: FormData) {
    startTransition(async () => {
      await addSatTest(formData)
      await load()
      setShowAddTest(false)
    })
  }

  async function handleLogDirect(formData: FormData) {
    startTransition(async () => {
      await logScoreDirect(formData)
      await load()
      setShowLogScore(false)
    })
  }

  async function handleScore(formData: FormData) {
    startTransition(async () => {
      await logSatScore(formData)
      await load()
      setScoringId(null)
    })
  }

  async function handleDeleteTest(id: string) {
    startTransition(async () => {
      await deleteSatTest(id)
      await load()
    })
  }

  async function handleAddExam(formData: FormData) {
    startTransition(async () => {
      await addExamDate(formData)
      await load()
      setShowAddExam(false)
    })
  }

  async function handleDeleteExam(id: string) {
    startTransition(async () => {
      await deleteExamDate(id)
      await load()
    })
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <SectionHeader title="SAT PREP" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowLogScore(v => !v); setShowAddTest(false); setShowAddExam(false) }}
              className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150"
            >
              <Plus size={14} />
              Log score
            </button>
            <button
              onClick={() => { setShowAddExam(v => !v); setShowAddTest(false); setShowLogScore(false) }}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              <CalendarDays size={14} />
              Add exam
            </button>
          </div>
        </div>

        {/* Log score form */}
        {showLogScore && (
          <form action={handleLogDirect} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3 animate-in">
            <p className={labelCls}>Log a score</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={sublabelCls}>Date taken</label>
                <input name="date" type="date" required className={inputCls}
                  defaultValue={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              <div>
                <label className={sublabelCls}>Type</label>
                <select name="is_practice" className={inputCls}>
                  <option value="true">Practice</option>
                  <option value="false">Real SAT</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={sublabelCls}>R/W Score</label>
                <input name="rw_score" type="number" min={200} max={800} step={10}
                  placeholder="200–800" required className={inputCls} />
              </div>
              <div>
                <label className={sublabelCls}>Math Score</label>
                <input name="math_score" type="number" min={200} max={800} step={10}
                  placeholder="200–800" required className={inputCls} />
              </div>
            </div>
            <input name="notes" placeholder="Notes (optional)" className={inputCls} />
            <div className="flex gap-2 pt-1">
              <button type="submit" className={btnGold}>Save</button>
              <button type="button" onClick={() => setShowLogScore(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        {/* Add exam date form */}
        {showAddExam && (
          <form action={handleAddExam} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3 animate-in">
            <p className={labelCls}>Add exam date</p>
            <div>
              <label className={sublabelCls}>Exam name</label>
              <input name="name" placeholder="e.g. AP US History, English Final, SAT" required className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={sublabelCls}>Type</label>
                <select name="type" className={inputCls}>
                  <option value="ap">AP Exam</option>
                  <option value="final">Final Exam</option>
                  <option value="sat">SAT</option>
                </select>
              </div>
              <div>
                <label className={sublabelCls}>Date</label>
                <input name="date" type="date" required className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className={btnGold}>Add</button>
              <button type="button" onClick={() => setShowAddExam(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        {/* Exam countdown strip */}
        {upcomingExams.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader title="UPCOMING EXAMS" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {upcomingExams.map(e => (
                <CountdownCard key={e.id} exam={e} onDelete={() => handleDeleteExam(e.id)} />
              ))}
            </div>
          </div>
        )}

        {upcomingExams.length === 0 && (
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 flex items-center gap-3">
            <Clock size={16} className="text-text-tertiary shrink-0" />
            <div>
              <p className="text-text-secondary text-sm">No upcoming exams added yet</p>
              <button onClick={() => setShowAddExam(true)} className="text-gold text-xs hover:text-gold-bright transition-colors duration-150 mt-0.5">
                Add your first exam →
              </button>
            </div>
          </div>
        )}

        {/* Score trend chart */}
        {chartData.length >= 1 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SectionHeader title="SCORE TREND" />
              {completed.length > 0 && completed[completed.length - 1].total_score && (
                <span className="ml-auto text-gold font-bold text-xl tabular-nums">
                  {completed[completed.length - 1].total_score}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
              <div className="flex items-center gap-4 mb-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gold inline-block rounded-full" />
                  Total
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-info inline-block rounded-full" />
                  R/W
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-warning inline-block rounded-full" />
                  Math
                </span>
                {chartExamLines.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-px h-3 bg-text-tertiary inline-block" />
                    Exam date
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[400, 1600]} tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8a8a85' }}
                    formatter={(val, name) => {
                      const labels: Record<string, string> = { score: 'Total', rw: 'R/W', math: 'Math' }
                      return [val, labels[String(name)] ?? name]
                    }}
                  />
                  {chartExamLines.map(line => (
                    <ReferenceLine
                      key={line.date + line.name}
                      x={line.date}
                      stroke="#5a5a55"
                      strokeDasharray="3 3"
                      label={{ value: line.name.length > 10 ? line.name.slice(0, 9) + '…' : line.name, fontSize: 9, fill: '#5a5a55', position: 'top' }}
                    />
                  ))}
                  <Line type="monotone" dataKey="score" stroke="#d4a85a" strokeWidth={2} dot={{ fill: '#d4a85a', r: 3 }} />
                  <Line type="monotone" dataKey="rw" stroke="#5a7a8e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="math" stroke="#c97a3a" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Score history */}
        {completed.length > 0 && (
          <div>
            <SectionHeader title="HISTORY" className="mb-3" />
            <div className="space-y-2">
              {[...completed].reverse().map(t => (
                <div key={t.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-text-primary text-sm font-medium">
                        {format(parseISO(t.taken_at!), 'MMM d, yyyy')}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${t.is_practice ? 'text-text-tertiary border-border-subtle' : 'text-gold border-gold/30'}`}>
                        {t.is_practice ? 'Practice' : 'Real SAT'}
                      </span>
                    </div>
                    {t.notes && <p className="text-xs text-text-tertiary truncate">{t.notes}</p>}
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-gold font-bold text-xl tabular-nums">{t.total_score}</p>
                      <p className="text-text-tertiary text-xs">{t.rw_score} · {t.math_score}</p>
                    </div>
                    <button onClick={() => handleDeleteTest(t.id)} className="text-text-tertiary hover:text-danger transition-colors duration-150">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming scheduled tests */}
        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader title="SCHEDULED TESTS" />
              <button
                onClick={() => { setShowAddTest(v => !v); setShowLogScore(false); setShowAddExam(false) }}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150 flex items-center gap-1"
              >
                <Plus size={12} /> Schedule
              </button>
            </div>
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
                      <button onClick={() => handleDeleteTest(t.id)} className="text-text-tertiary hover:text-danger transition-colors duration-150">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {scoringId === t.id && (
                    <form action={handleScore} className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                      <input type="hidden" name="id" value={t.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={sublabelCls}>R/W Score</label>
                          <input name="rw_score" type="number" min={200} max={800} step={10} placeholder="200–800" required className={inputCls} />
                        </div>
                        <div>
                          <label className={sublabelCls}>Math Score</label>
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
          </div>
        )}

        {/* Schedule test form */}
        {showAddTest && (
          <form action={handleAddTest} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3 animate-in">
            <p className={labelCls}>Schedule a test</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={sublabelCls}>Date & Time</label>
                <input name="scheduled_for" type="datetime-local" required className={inputCls} />
              </div>
              <div>
                <label className={sublabelCls}>Type</label>
                <select name="is_practice" className={inputCls}>
                  <option value="true">Practice test</option>
                  <option value="false">Real SAT</option>
                </select>
              </div>
            </div>
            <div>
              <label className={sublabelCls}>Source URL (practice tests)</label>
              <input name="source_url" type="url" placeholder="CollegeBoard link..." className={inputCls} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className={btnGold}>Schedule</button>
              <button type="button" onClick={() => setShowAddTest(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        {/* Official SAT dates */}
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
          <SectionHeader title="OFFICIAL SAT DATES" className="mb-3" />
          <div className="space-y-1.5">
            {OFFICIAL_SAT_DATES.map(d => {
              const date = parseISO(d)
              const past = !isFuture(date)
              const days = differenceInDays(date, new Date())
              return (
                <div key={d} className={`flex justify-between text-sm ${past ? 'text-text-tertiary opacity-40' : 'text-text-secondary'}`}>
                  <span>{format(date, 'MMMM d, yyyy')}</span>
                  {!past && <span className="text-text-tertiary text-xs">{days}d away</span>}
                </div>
              )
            })}
          </div>
        </div>

        {tests.length === 0 && exams.length === 0 && (
          <p className="text-text-tertiary text-sm text-center py-4">
            Add your exam dates and log your first score to get started.
          </p>
        )}
      </div>
    </AppShell>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase'
const sublabelCls = 'block text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
