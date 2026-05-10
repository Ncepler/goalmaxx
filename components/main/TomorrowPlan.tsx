'use client'

import { useState, useTransition } from 'react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createTask, deleteTask } from '@/app/actions/tasks'
import type { Task } from '@/lib/types'
import { format, addDays } from 'date-fns'

interface TomorrowPlanProps {
  tasks: Task[]
  todayDate: string
}

export function TomorrowPlan({ tasks, todayDate }: TomorrowPlanProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [, startTransition] = useTransition()

  const now = new Date()
  const hour = now.getHours()
  // Locked midnight–6am
  const isLocked = hour >= 0 && hour < 6

  const tomorrowDate = format(addDays(new Date(todayDate + 'T12:00:00'), 1), 'yyyy-MM-dd')
  const tomorrowLabel = format(addDays(new Date(todayDate + 'T12:00:00'), 1), 'EEE, MMM d').toUpperCase()

  const isEvening = hour >= 21
  const showPrompt = isEvening && tasks.length === 0

  return (
    <div>
      <SectionHeader title={`PLAN TOMORROW — ${tomorrowLabel}`} />

      {isLocked ? (
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 flex items-center gap-3 text-text-tertiary">
          <Lock size={16} />
          <span className="text-sm">Locked until 6 AM</span>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5">
          {showPrompt && (
            <p className="text-sm text-warning mb-4">
              Plan tomorrow before you sleep. What&apos;s on your plate?
            </p>
          )}

          {tasks.length === 0 && !showPrompt && (
            <p className="text-sm text-text-tertiary mb-4">No tasks planned yet.</p>
          )}

          <div className="space-y-1 mb-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 py-2 border-b border-border-subtle last:border-0">
                <span className="flex-1 text-sm text-text-primary">{task.title}</span>
                {task.est_minutes && (
                  <span className="text-xs text-text-tertiary tabular-nums">{task.est_minutes}m</span>
                )}
                <button
                  onClick={() => startTransition(() => deleteTask(task.id))}
                  className="text-text-tertiary hover:text-danger transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {showAdd ? (
            <form
              action={createTask}
              onSubmit={() => setShowAdd(false)}
            >
              <input type="hidden" name="due_date" value={tomorrowDate} />
              <div className="flex gap-2">
                <input
                  name="title"
                  autoFocus
                  placeholder="Tomorrow's task…"
                  className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-bg-base border border-border-strong text-gold text-sm"
                >
                  Add
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="text-text-tertiary text-sm px-2">
                  ✕
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <Plus size={14} /> Add task
            </button>
          )}

          <p className="mt-4 text-[10px] text-text-tertiary">
            Write tonight · locked 12 AM–6 AM · rolls into today at 6 AM
          </p>
        </div>
      )}
    </div>
  )
}
