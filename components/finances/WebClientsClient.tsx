'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createWebClient, deleteWebClient } from '@/app/actions/web_clients'
import { format, parseISO, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Globe, AlertCircle } from 'lucide-react'

interface WebClient {
  id: string
  company: string
  flat_fee: number | null
  annual_fee: number | null
  annual_date: string | null
  notes: string | null
}

export function WebClientsClient({ clients }: { clients: WebClient[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const totalAnnual = clients.reduce((s, c) => s + (c.annual_fee ?? 0), 0)
  const totalFlat = clients.reduce((s, c) => s + (c.flat_fee ?? 0), 0)

  function handleAdd(fd: FormData) {
    startTransition(async () => {
      await createWebClient(fd)
      router.refresh()
      setShowAdd(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteWebClient(id)
      router.refresh()
    })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">

      <div className="flex items-start justify-between">
        <SectionHeader title="WEB CLIENTS" />
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150"
        >
          <Plus size={14} /> Add client
        </button>
      </div>

      {/* Summary */}
      {clients.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
            <p className={labelCls}>Total flat fees</p>
            <p className="text-gold font-bold text-2xl tabular-nums">${totalFlat.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
            <p className={labelCls}>Annual recurring</p>
            <p className="text-gold font-bold text-2xl tabular-nums">${totalAnnual.toLocaleString()}<span className="text-sm font-normal text-text-tertiary">/yr</span></p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <form action={handleAdd} className="rounded-xl bg-bg-elevated border border-border-strong p-4 space-y-3 animate-in">
          <p className={labelCls}>New client</p>
          <div>
            <label className={sublabelCls}>Company</label>
            <input name="company" placeholder="Company name" required className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={sublabelCls}>Flat fee ($)</label>
              <input name="flat_fee" type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={sublabelCls}>Annual fee ($)</label>
              <input name="annual_fee" type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={sublabelCls}>Annual renewal date</label>
            <input name="annual_date" type="date" className={inputCls} defaultValue={`2026-${new Date().toISOString().slice(5, 10)}`} />
          </div>
          <div>
            <label className={sublabelCls}>Notes</label>
            <input name="notes" placeholder="Optional notes" className={inputCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className={btnGold}>Save</button>
            <button type="button" onClick={() => setShowAdd(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      )}

      {/* Client list */}
      <div className="space-y-3">
        {clients.map(c => {
          const daysUntilRenewal = c.annual_date
            ? differenceInDays(parseISO(c.annual_date), new Date())
            : null
          const renewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 30 && daysUntilRenewal >= 0

          return (
            <div key={c.id} className={`rounded-xl border p-5 ${renewalSoon ? 'bg-warning/5 border-warning/30' : 'bg-bg-elevated border-border-subtle'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-text-tertiary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gold font-semibold">{c.company}</p>
                    {c.notes && <p className="text-xs text-text-tertiary mt-0.5">{c.notes}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-text-tertiary hover:text-danger transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className={sublabelCls}>Flat fee</p>
                  <p className="text-text-primary font-medium text-sm">
                    {c.flat_fee != null ? `$${c.flat_fee.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div>
                  <p className={sublabelCls}>Annual</p>
                  <p className="text-text-primary font-medium text-sm">
                    {c.annual_fee != null ? `$${c.annual_fee.toLocaleString()}/yr` : '—'}
                  </p>
                </div>
                <div>
                  <p className={sublabelCls}>Renews</p>
                  <div className="flex items-center gap-1">
                    {renewalSoon && <AlertCircle size={11} className="text-warning shrink-0" />}
                    <p className={`font-medium text-sm ${renewalSoon ? 'text-warning' : 'text-text-primary'}`}>
                      {c.annual_date ? format(parseISO(c.annual_date), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                  {renewalSoon && daysUntilRenewal !== null && (
                    <p className="text-[10px] text-warning mt-0.5">{daysUntilRenewal}d away</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {clients.length === 0 && !showAdd && (
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-8 text-center">
            <Globe size={24} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No clients yet</p>
            <button onClick={() => setShowAdd(true)} className="mt-2 text-gold text-xs hover:text-gold-bright transition-colors duration-150">
              Add your first client →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase'
const sublabelCls = 'block text-[11px] font-medium tracking-[0.15em] text-text-tertiary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
