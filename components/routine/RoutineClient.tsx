'use client'

import { useState, useTransition } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { saveRoutinePlan, importHomeworkAsItems } from '@/app/actions/routine'
import type { RoutineItem, ScheduledBlock, ScheduleResult } from '@/lib/routine-algorithm'
import { buildSchedule } from '@/lib/routine-algorithm'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Clock, AlertTriangle, Download } from 'lucide-react'

const TYPE_OPTIONS = ['homework', 'sat', 'piano', 'workout', 'game', 'reading', 'other'] as const
const PRIORITY_OPTIONS = ['low', 'med', 'high'] as const

export interface SavedPlan {
  items: RoutineItem[]
  bedtime: string
  generated_schedule: ScheduleResult | null
}

export function RoutineClient({
  bedtimeDefault,
  savedPlan,
  today,
}: {
  bedtimeDefault: string
  savedPlan: SavedPlan | null
  today: string
}) {
  const [bedtime, setBedtime] = useState(savedPlan?.bedtime ?? bedtimeDefault)
  const [items, setItems] = useState<RoutineItem[]>(savedPlan?.items ?? [])
  const [schedule, setSchedule] = useState<ScheduleResult | null>(savedPlan?.generated_schedule ?? null)
  const [showForm, setShowForm] = useState(false)
  const [importing, setImporting] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Form state for new item
  const [newType, setNewType] = useState<RoutineItem['type']>('other')
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState(30)
  const [newPriority, setNewPriority] = useState<RoutineItem['priority']>('med')
  const [newHardTime, setNewHardTime] = useState('')
  const [newFun, setNewFun] = useState(false)
  const [newLength, setNewLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [newNotes, setNewNotes] = useState('')

  function addItem() {
    if (!newTitle.trim()) return
    const item: RoutineItem = {
      type: newType,
      title: newTitle.trim(),
      duration_min: newType === 'homework' ? { short: 20, medium: 35, long: 60 }[newLength] : newDuration,
      priority: newType === 'homework' ? (newLength === 'long' && !newFun ? 'high' : newLength === 'short' ? 'low' : 'med') : newPriority,
      hard_time: newHardTime || null,
      fun: newFun,
      length: newType === 'homework' ? newLength : undefined,
      notes: newNotes || undefined,
    }
    const updated = [...items, item]
    setItems(updated)
    setSchedule(buildSchedule(updated, bedtime))
    setNewTitle('')
    setNewNotes('')
    setNewHardTime('')
    setShowForm(false)
  }

  function removeItem(idx: number) {
    const updated = items.filter((_, i) => i !== idx)
    setItems(updated)
    setSchedule(buildSchedule(updated, bedtime))
  }

  function handleBedtimeChange(t: string) {
    setBedtime(t)
    if (items.length > 0) setSchedule(buildSchedule(items, t))
  }

  function handleImport() {
    setImporting(true)
    startTransition(async () => {
      const imported = await importHomeworkAsItems(today)
      const updated = [...items, ...imported.filter(i =>
        !items.some(existing => existing.title === i.title)
      )]
      setItems(updated)
      setSchedule(buildSchedule(updated, bedtime))
      setImporting(false)
    })
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('items', JSON.stringify(items))
      fd.set('bedtime', bedtime)
      await saveRoutinePlan(fd)
      router.refresh()
    })
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="ROUTINE PLANNER" className="mb-0" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-gold transition-colors duration-150 disabled:opacity-50"
          >
            <Download size={12} /> Import HW
          </button>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-text-secondary uppercase tracking-wider">Bedtime</label>
            <input
              type="time"
              value={bedtime}
              onChange={e => handleBedtimeChange(e.target.value)}
              className="bg-bg-input border border-border-subtle rounded-lg px-2 py-1 text-gold text-xs focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {schedule && schedule.overMinutes > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2">
          <AlertTriangle size={14} className="text-danger shrink-0" />
          <p className="text-danger text-xs">{schedule.overMinutes}min over — drop something</p>
        </div>
      )}

      {/* Add item form */}
      <div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150"
        >
          <Plus size={14} /> Add item
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value as RoutineItem['type'])} className={inp}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Priority</label>
              {newType === 'homework' ? (
                <select value={newLength} onChange={e => {
                  const l = e.target.value as 'short' | 'medium' | 'long'
                  setNewLength(l)
                  setNewDuration({ short: 20, medium: 35, long: 60 }[l])
                }} className={inp}>
                  <option value="short">Short (≤20m)</option>
                  <option value="medium">Medium (20–45m)</option>
                  <option value="long">Long (45m+)</option>
                </select>
              ) : (
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as RoutineItem['priority'])} className={inp}>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
            </div>
          </div>

          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Title"
            className={inp}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Duration (min)</label>
              <input type="number" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} min={5} className={inp} />
            </div>
            <div>
              <label className={lbl}>Fixed time (optional)</label>
              <input type="time" value={newHardTime} onChange={e => setNewHardTime(e.target.value)} className={inp} />
            </div>
          </div>

          {newType === 'homework' && (
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" checked={newFun} onChange={e => setNewFun(e.target.checked)} className="accent-gold" />
              Fun assignment (creative, interested in it)
            </label>
          )}

          <input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes (optional)" className={inp} />

          <div className="flex gap-2">
            <button onClick={addItem} className={btnGold}>Add to plan</button>
            <button onClick={() => setShowForm(false)} className={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title={`${items.length} ITEM${items.length !== 1 ? 'S' : ''}`} />
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-text-primary text-sm font-medium truncate">{item.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-warning/10 text-warning' :
                    item.priority === 'med' ? 'bg-info/10 text-info' : 'text-text-tertiary'
                  }`}>{item.priority}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-tertiary capitalize">{item.type}</span>
                  <span className="text-[10px] text-text-tertiary">{item.duration_min}m</span>
                  {item.hard_time && <span className="text-[10px] text-warning">{item.hard_time} fixed</span>}
                  {item.fun && <span className="text-[10px] text-success">fun</span>}
                </div>
              </div>
              <button onClick={() => removeItem(idx)} className="text-text-tertiary hover:text-danger transition-colors duration-150 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Generated schedule */}
      {schedule && schedule.blocks.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title="TONIGHT'S SCHEDULE" />
          <div className="space-y-1.5">
            {schedule.blocks.map((block: ScheduledBlock, idx: number) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg bg-bg-elevated border border-border-subtle px-4 py-3">
                <div className="flex items-center gap-1.5 text-text-tertiary text-xs tabular-nums shrink-0 w-24">
                  <Clock size={11} />
                  {block.start} – {block.end}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm truncate">{block.item.title}</p>
                  <p className="text-text-tertiary text-xs capitalize">{block.item.type} · {block.item.duration_min}m</p>
                </div>
                <span className={`text-[10px] shrink-0 ${
                  block.item.priority === 'high' ? 'text-warning' :
                  block.item.priority === 'med' ? 'text-info' : 'text-text-tertiary'
                }`}>{block.item.priority}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[10px] text-text-tertiary">Bedtime {bedtime}</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
        </div>
      )}

      {schedule && schedule.unscheduled.length > 0 && (
        <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
          <p className="text-warning text-xs font-medium mb-1">Couldn't fit {schedule.unscheduled.length} item{schedule.unscheduled.length !== 1 ? 's' : ''}:</p>
          {schedule.unscheduled.map((item, i) => (
            <p key={i} className="text-text-secondary text-xs">• {item.title} ({item.duration_min}m)</p>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-gold text-sm font-medium hover:border-gold transition-colors duration-150">
          Save plan
        </button>
      )}

      {items.length === 0 && !showForm && (
        <p className="text-text-tertiary text-sm">Add items above, or import today's homework.</p>
      )}
    </div>
  )
}

const inp = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const lbl = 'block text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
