'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { logScreenTime } from '@/app/actions/screentime'
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Log {
  date: string
  total_minutes: number | null
  social_minutes: number | null
  productive_minutes: number | null
  source: string | null
}

export function ScreenTimeClient({
  logs,
  dailyLimitMinutes,
}: {
  logs: Log[]
  dailyLimitMinutes: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const today = logs[0]
  const avg30 = logs.length
    ? Math.round(logs.reduce((s, l) => s + (l.total_minutes ?? 0), 0) / logs.length)
    : 0

  const chartData = [...logs].reverse().slice(-14).map(l => ({
    date: format(parseISO(l.date), 'M/d'),
    total: l.total_minutes ?? 0,
    social: l.social_minutes ?? 0,
    limit: dailyLimitMinutes,
  }))

  function fmt(min: number) {
    return `${Math.floor(min / 60)}h ${min % 60}m`
  }

  function handleLog(fd: FormData) {
    startTransition(async () => {
      await logScreenTime(fd)
      router.refresh()
      setShowForm(false)
    })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
          <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">Today</p>
          <p className={`font-bold text-xl tabular-nums ${today && (today.total_minutes ?? 0) > dailyLimitMinutes ? 'text-danger' : 'text-gold'}`}>
            {today ? fmt(today.total_minutes ?? 0) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
          <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">Social</p>
          <p className="text-gold font-bold text-xl tabular-nums">
            {today ? fmt(today.social_minutes ?? 0) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
          <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">30d avg</p>
          <p className="text-text-primary font-bold text-xl tabular-nums">{fmt(avg30)}</p>
        </div>
      </div>

      {/* Log form */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs text-gold hover:text-gold-bright transition-colors duration-150"
        >
          {showForm ? 'Cancel' : '+ Log today'}
        </button>
      </div>

      {showForm && (
        <form action={handleLog} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
          <SectionHeader title="LOG TODAY'S SCREEN TIME" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Total (min)</label>
              <input name="total_minutes" type="number" min={0} placeholder="0" className={inputCls} defaultValue={today?.total_minutes ?? ''} />
            </div>
            <div>
              <label className={labelCls}>Social (min)</label>
              <input name="social_minutes" type="number" min={0} placeholder="0" className={inputCls} defaultValue={today?.social_minutes ?? ''} />
            </div>
            <div>
              <label className={labelCls}>Productive (min)</label>
              <input name="productive_minutes" type="number" min={0} placeholder="0" className={inputCls} defaultValue={today?.productive_minutes ?? ''} />
            </div>
          </div>
          <button type="submit" className={btnGold}>Save</button>
        </form>
      )}

      {/* Trend chart */}
      {chartData.length > 1 && (
        <>
          <SectionHeader title="30-DAY TREND" />
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#5a5a55' }} axisLine={false} tickLine={false} width={30}
                  tickFormatter={v => `${Math.floor(v / 60)}h`} />
                <Tooltip
                  contentStyle={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmt(Number(v ?? 0))]}
                />
                <Bar dataKey="total" fill="#8a6f3a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="social" fill="#a04545" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                <span className="w-2 h-2 rounded-sm bg-gold-dim inline-block" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                <span className="w-2 h-2 rounded-sm bg-danger inline-block" /> Social
              </span>
              <span className="ml-auto text-[10px] text-text-tertiary">
                Daily goal: {fmt(dailyLimitMinutes)} social
              </span>
            </div>
          </div>
        </>
      )}

      {/* History */}
      <SectionHeader title="HISTORY" />
      <div className="space-y-2">
        {logs.slice(0, 14).map(l => {
          const over = (l.total_minutes ?? 0) > dailyLimitMinutes
          return (
            <div key={l.date} className="flex items-center gap-4 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
              <span className="text-text-secondary text-sm w-16 shrink-0">{format(parseISO(l.date), 'MMM d')}</span>
              <span className={`font-medium text-sm tabular-nums flex-1 ${over ? 'text-danger' : 'text-text-primary'}`}>
                {fmt(l.total_minutes ?? 0)}
              </span>
              <span className="text-text-tertiary text-xs">{fmt(l.social_minutes ?? 0)} social</span>
              {l.source === 'shortcut' && (
                <span className="text-[10px] text-info">auto</span>
              )}
            </div>
          )
        })}
        {logs.length === 0 && <p className="text-text-tertiary text-sm">No logs yet.</p>}
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
