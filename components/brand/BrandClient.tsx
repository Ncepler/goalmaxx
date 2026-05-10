'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { addAccount, logSnapshot } from '@/app/actions/brand'
import { format, parseISO, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Account {
  id: string
  platform: string
  handle: string
  display_name: string | null
}

interface Snapshot {
  id: string
  account_id: string
  date: string
  followers: number | null
  views_total: number | null
  engagement: number | null
}

export function BrandClient({ accounts, snapshots }: { accounts: Account[]; snapshots: Snapshot[] }) {
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleAddAccount(fd: FormData) {
    startTransition(async () => { await addAccount(fd); router.refresh(); setShowAddAccount(false) })
  }

  function handleLog(fd: FormData) {
    startTransition(async () => { await logSnapshot(fd); router.refresh(); setLoggingId(null) })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader title="BRAND" className="mb-0" />
        <button onClick={() => setShowAddAccount(v => !v)} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150">
          <Plus size={14} /> Add account
        </button>
      </div>

      {showAddAccount && (
        <form action={handleAddAccount} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
          <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">New account</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Platform</label>
              <select name="platform" className={inputCls}>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Handle</label>
              <input name="handle" placeholder="@handle" required className={inputCls} />
            </div>
          </div>
          <input name="display_name" placeholder="Display name (optional)" className={inputCls} />
          <div className="flex gap-2">
            <button type="submit" className={btnGold}>Add</button>
            <button type="button" onClick={() => setShowAddAccount(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      )}

      {accounts.length === 0 && (
        <p className="text-text-tertiary text-sm">No accounts tracked yet. Add one above.</p>
      )}

      {accounts.map(account => {
        const acctSnaps = snapshots
          .filter(s => s.account_id === account.id)
          .sort((a, b) => a.date.localeCompare(b.date))

        const latest = acctSnaps[acctSnaps.length - 1]
        const prev = acctSnaps[acctSnaps.length - 2]
        const delta = latest && prev && latest.followers != null && prev.followers != null
          ? latest.followers - prev.followers
          : null

        const chartData = acctSnaps.slice(-30).map(s => ({
          date: format(parseISO(s.date), 'M/d'),
          followers: s.followers ?? 0,
        }))

        return (
          <div key={account.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">{account.platform}</p>
                <p className="text-text-primary font-medium">{account.display_name ?? account.handle}</p>
                <p className="text-text-tertiary text-xs">{account.handle}</p>
              </div>
              <div className="text-right">
                {latest?.followers != null && (
                  <p className="text-gold font-bold text-2xl tabular-nums">
                    {latest.followers.toLocaleString()}
                  </p>
                )}
                {delta !== null && (
                  <p className={`text-xs flex items-center gap-1 justify-end mt-0.5 ${delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-text-tertiary'}`}>
                    {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {delta > 0 ? '+' : ''}{delta}
                  </p>
                )}
              </div>
            </div>

            {chartData.length >= 2 && (
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#5a5a55' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 11 }}
                    itemStyle={{ color: '#d4a85a' }}
                  />
                  <Line type="monotone" dataKey="followers" stroke="#d4a85a" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
              <span className="text-text-tertiary text-xs">
                {latest ? `Last: ${format(parseISO(latest.date), 'MMM d')}` : 'No data yet'}
              </span>
              <button
                onClick={() => setLoggingId(loggingId === account.id ? null : account.id)}
                className="text-xs text-gold border border-gold/30 rounded-full px-2 py-0.5 hover:bg-gold/10 transition-colors duration-150"
              >
                Log today
              </button>
            </div>

            {loggingId === account.id && (
              <form action={handleLog} className="pt-2 border-t border-border-subtle space-y-3">
                <input type="hidden" name="account_id" value={account.id} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>Followers</label>
                    <input name="followers" type="number" min={0} placeholder="0" className={inputCls} defaultValue={latest?.followers ?? ''} />
                  </div>
                  <div>
                    <label className={labelCls}>Views total</label>
                    <input name="views_total" type="number" min={0} placeholder="0" className={inputCls} defaultValue={latest?.views_total ?? ''} />
                  </div>
                  <div>
                    <label className={labelCls}>Engagement %</label>
                    <input name="engagement" type="number" step="0.01" min={0} max={100} placeholder="0.00" className={inputCls} defaultValue={latest?.engagement ?? ''} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className={btnGold}>Save</button>
                  <button type="button" onClick={() => setLoggingId(null)} className={btnGhost}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )
      })}
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
