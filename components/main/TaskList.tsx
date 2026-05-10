'use client'

import { useState, useTransition } from 'react'
import { Zap, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createTask, toggleTask, deleteTask, pushIncompleteToTomorrow } from '@/app/actions/tasks'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  date: string
  label?: string
}

export function TaskList({ tasks, date, label = 'GOALMAXXING' }: TaskListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [, startTransition] = useTransition()

  const completed = tasks.filter(t => t.completed)
  const incomplete = tasks.filter(t => !t.completed)

  function handleToggle(id: string, current: boolean) {
    startTransition(() => toggleTask(id, !current))
  }

  function handleDelete(id: string) {
    startTransition(() => deleteTask(id))
  }

  function handlePushTomorrow() {
    startTransition(() => pushIncompleteToTomorrow(date))
  }

  return (
    <div>
      <SectionHeader title={label} />

      {/* Counter + segmented bar */}
      <div className="mb-5">
        <div className="text-3xl font-bold tabular-nums mb-3">
          <span className="text-gold">{completed.length}</span>
          <span className="text-text-secondary"> / {tasks.length} COMPLETE</span>
        </div>

        {tasks.length > 0 && (
          <div className="flex gap-[3px] h-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex-1 rounded-full transition-colors duration-300 ${
                  task.completed ? 'bg-success' : 'bg-bg-input'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task rows */}
      <div className="space-y-1">
        {[...incomplete, ...completed].map(task => (
          <TaskRow
            key={task.id}
            task={task}
            expanded={expandedId === task.id}
            onToggleExpand={() => setExpandedId(expandedId === task.id ? null : task.id)}
            onToggle={() => handleToggle(task.id, task.completed ?? false)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </div>

      {/* Add task */}
      {showAdd ? (
        <form
          action={createTask}
          onSubmit={() => setShowAdd(false)}
          className="mt-3"
        >
          <input type="hidden" name="due_date" value={date} />
          <div className="flex gap-2">
            <input
              name="title"
              autoFocus
              placeholder="Task title…"
              className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-strong text-gold text-sm font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-2 rounded-lg text-text-tertiary text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-3 flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <Plus size={14} /> Add task
        </button>
      )}

      {/* Push remaining */}
      {incomplete.length > 0 && (
        <button
          onClick={handlePushTomorrow}
          className="mt-4 text-xs text-text-tertiary hover:text-text-secondary underline underline-offset-2 transition-colors"
        >
          Push {incomplete.length} remaining to tomorrow
        </button>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  expanded: boolean
  onToggleExpand: () => void
  onToggle: () => void
  onDelete: () => void
}

function TaskRow({ task, expanded, onToggleExpand, onToggle, onDelete }: TaskRowProps) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        task.priority === 1 && !task.completed
          ? 'border-l-2 border-l-warning border-y-border-subtle border-r-border-subtle bg-bg-elevated'
          : 'border-border-subtle bg-bg-elevated'
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-success border-success'
              : 'border-border-strong hover:border-success'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-bg-base" fill="currentColor" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
          {task.title}
        </span>

        {/* Must-do lightning bolt */}
        {task.priority === 1 && !task.completed && (
          <Zap size={12} className="text-warning shrink-0" />
        )}

        {/* Expand / est time */}
        {task.est_minutes && !expanded && (
          <span className="text-xs text-text-tertiary tabular-nums">{task.est_minutes}m</span>
        )}

        <button onClick={onToggleExpand} className="text-text-tertiary hover:text-text-secondary transition-colors">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border-subtle">
          {task.notes && (
            <p className="text-xs text-text-secondary pt-2">{task.notes}</p>
          )}
          {task.est_minutes && (
            <p className="text-xs text-text-tertiary">Est: {task.est_minutes} min</p>
          )}
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
