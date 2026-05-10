'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createSubscription, deleteSubscription, createOrder, updateOrderStatus } from '@/app/actions/finances'
import { format, parseISO, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertCircle } from 'lucide-react'

interface Sub {
  id: string
  service: string
  cost: number
  currency: string | null
  cadence: string
  next_charge_date: string | null
}

interface Order {
  id: string
  source: string
  amount: number
  currency: string | null
  expected_date: string | null
  status: string | null
  notes: string | null
}

interface Usage {
  cost_usd: number
  input_tokens: number
  output_tokens: number
  feature: string
  created_at: string | null
}

export function FinancesClient({
  subscriptions,
  orders,
  usageCosts,
  monthStart,
}: {
  subscriptions: Sub[]
  orders: Order[]
  usageCosts: Usage[]
  monthStart: string
  monthEnd: string
}) {
  const [showAddSub, setShowAddSub] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const monthlyBurn = subscriptions.reduce((total, s) => {
    if (s.cadence === 'monthly') return total + s.cost
    if (s.cadence === 'annual') return total + s.cost / 12
    if (s.cadence === 'weekly') return total + s.cost * 4.33
    return total
  }, 0)

  const ordersThisMonth = orders.filter(o => o.expected_date && o.expected_date >= monthStart)
  const received = ordersThisMonth.filter(o => o.status === 'received').reduce((s, o) => s + o.amount, 0)
  const expected = ordersThisMonth.reduce((s, o) => s + o.amount, 0)

  const apiSpend = usageCosts.reduce((s, u) => s + (u.cost_usd ?? 0), 0)
  const apiInputTokens = usageCosts.reduce((s, u) => s + (u.input_tokens ?? 0), 0)
  const apiOutputTokens = usageCosts.reduce((s, u) => s + (u.output_tokens ?? 0), 0)

  const netMonth = received - monthlyBurn - apiSpend

  function handleAddSub(fd: FormData) {
    startTransition(async () => { await createSubscription(fd); router.refresh(); setShowAddSub(false) })
  }

  function handleDeleteSub(id: string) {
    startTransition(async () => { await deleteSubscription(id); router.refresh() })
  }

  function handleAddOrder(fd: FormData) {
    startTransition(async () => { await createOrder(fd); router.refresh(); setShowAddOrder(false) })
  }

  function handleOrderStatus(id: string, status: 'pending' | 'received' | 'overdue') {
    startTransition(async () => { await updateOrderStatus(id, status); router.refresh() })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">

      {/* Net summary */}
      <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-3">
        <SectionHeader title="THIS MONTH" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className={labelCls}>In</p>
            <p className="text-success font-bold text-xl tabular-nums">+${received.toFixed(2)}</p>
          </div>
          <div>
            <p className={labelCls}>Out</p>
            <p className="text-danger font-bold text-xl tabular-nums">−${(monthlyBurn + apiSpend).toFixed(2)}</p>
          </div>
          <div>
            <p className={labelCls}>Net</p>
            <p className={`font-bold text-xl tabular-nums ${netMonth >= 0 ? 'text-gold' : 'text-danger'}`}>
              {netMonth >= 0 ? '+' : ''}${netMonth.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="ACTIVE SUBSCRIPTIONS" className="mb-0" />
          <button onClick={() => setShowAddSub(v => !v)} className={addBtn}>
            <Plus size={14} /> Add
          </button>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 mb-3">
          <p className={labelCls}>Monthly burn</p>
          <p className="text-gold font-bold text-2xl tabular-nums">${monthlyBurn.toFixed(2)}</p>
          <p className="text-text-tertiary text-xs mt-0.5">${(monthlyBurn * 12).toFixed(2)} / year</p>
        </div>

        {showAddSub && (
          <form action={handleAddSub} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3 mb-3">
            <input name="service" placeholder="Service name" required className={inputCls} />
            <div className="grid grid-cols-3 gap-2">
              <input name="cost" type="number" step="0.01" placeholder="Cost" required className={inputCls} />
              <select name="currency" className={inputCls}>
                <option value="USD">USD</option>
              </select>
              <select name="cadence" className={inputCls}>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Next charge date</label>
              <input name="next_charge_date" type="date" className={inputCls} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={btnGold}>Add</button>
              <button type="button" onClick={() => setShowAddSub(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {subscriptions.map(s => {
            const daysUntil = s.next_charge_date ? differenceInDays(parseISO(s.next_charge_date), new Date()) : null
            const nearCharge = daysUntil !== null && daysUntil <= 3
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium">{s.service}</p>
                  <p className="text-text-tertiary text-xs capitalize">{s.cadence}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-text-primary text-sm font-medium">${s.cost.toFixed(2)}</p>
                  {s.next_charge_date && (
                    <p className={`text-xs ${nearCharge ? 'text-warning' : 'text-text-tertiary'}`}>
                      {nearCharge && <AlertCircle size={10} className="inline mr-0.5" />}
                      {format(parseISO(s.next_charge_date), 'MMM d')}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDeleteSub(s.id)} className="text-text-tertiary hover:text-danger transition-colors duration-150 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
          {subscriptions.length === 0 && <p className="text-text-tertiary text-sm">No subscriptions.</p>}
        </div>
      </div>

      {/* Incoming orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="INCOMING ORDERS" className="mb-0" />
          <button onClick={() => setShowAddOrder(v => !v)} className={addBtn}>
            <Plus size={14} /> Add
          </button>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 mb-3">
          <div className="flex items-end justify-between">
            <div>
              <p className={labelCls}>Expected this month</p>
              <p className="text-gold font-bold text-2xl tabular-nums">${expected.toFixed(2)}</p>
            </div>
            <p className="text-text-secondary text-sm">${received.toFixed(2)} received</p>
          </div>
          {expected > 0 && (
            <div className="mt-3 h-1 bg-bg-input rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min(100, (received / expected) * 100)}%` }} />
            </div>
          )}
        </div>

        {showAddOrder && (
          <form action={handleAddOrder} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3 mb-3">
            <input name="source" placeholder="Source (e.g. PackPerfect order)" required className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <input name="amount" type="number" step="0.01" placeholder="Amount" required className={inputCls} />
              <input name="expected_date" type="date" className={inputCls} />
            </div>
            <input name="notes" placeholder="Notes (optional)" className={inputCls} />
            <div className="flex gap-2">
              <button type="submit" className={btnGold}>Add</button>
              <button type="button" onClick={() => setShowAddOrder(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium">{o.source}</p>
                {o.expected_date && <p className="text-text-tertiary text-xs">Expected {format(parseISO(o.expected_date), 'MMM d')}</p>}
                {o.notes && <p className="text-text-tertiary text-xs">{o.notes}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-gold font-medium text-sm">${o.amount.toFixed(2)}</p>
                <div className="flex gap-1 mt-1">
                  {(['pending', 'received', 'overdue'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleOrderStatus(o.id, st)}
                      className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize transition-colors duration-150 ${
                        o.status === st
                          ? st === 'received' ? 'bg-success/20 text-success' : st === 'overdue' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                          : 'text-text-tertiary border border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-text-tertiary text-sm">No orders logged.</p>}
        </div>
      </div>

      {/* Claude API spend */}
      <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-3">
        <SectionHeader title="CLAUDE SPEND" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className={labelCls}>This month</p>
            <p className="text-gold font-bold text-xl tabular-nums">${apiSpend.toFixed(4)}</p>
          </div>
          <div>
            <p className={labelCls}>Input tokens</p>
            <p className="text-text-primary font-medium tabular-nums">{apiInputTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className={labelCls}>Output tokens</p>
            <p className="text-text-primary font-medium tabular-nums">{apiOutputTokens.toLocaleString()}</p>
          </div>
        </div>
        {/* TODO(api-usage): swap for Anthropic usage endpoint when available */}
        <p className="text-text-tertiary text-xs">Claude.ai limits not exposed by Anthropic — manual checks only.</p>
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
const addBtn = 'flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150'
