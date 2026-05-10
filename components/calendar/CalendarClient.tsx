'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type EventType = 'task' | 'sat' | 'game' | 'sub' | 'homework'

interface CalEvent {
  id: string
  date: string
  title: string
  type: EventType
  meta?: string
}

const TYPE_COLORS: Record<EventType, string> = {
  task: 'bg-gold/70',
  sat: 'bg-warning',
  game: 'bg-danger/70',
  sub: 'bg-text-tertiary',
  homework: 'bg-info/70',
}

const TYPE_LABEL_COLORS: Record<EventType, string> = {
  task: 'text-gold',
  sat: 'text-warning',
  game: 'text-danger',
  sub: 'text-text-tertiary',
  homework: 'text-info',
}

export function CalendarClient({ events }: { events: CalEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const eventsByDate = events.reduce<Record<string, CalEvent[]>>((acc, e) => {
    const key = e.date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const selectedEvents = selectedDate
    ? events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <div className="px-5 pt-6 pb-10 max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="text-text-secondary hover:text-gold transition-colors duration-150">
          <ChevronLeft size={18} />
        </button>
        <SectionHeader title={format(currentMonth, 'MMMM yyyy').toUpperCase()} className="mb-0" />
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="text-text-secondary hover:text-gold transition-colors duration-150">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(Object.entries(TYPE_LABEL_COLORS) as [EventType, string][]).map(([type, color]) => (
          <span key={type} className={`flex items-center gap-1 text-[10px] ${color} uppercase tracking-wider`}>
            <span className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[type]} inline-block`} />
            {type}
          </span>
        ))}
      </div>

      {/* Month grid */}
      <div>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-text-tertiary uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-border-subtle rounded-xl overflow-hidden">
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[key] ?? []
            const inMonth = isSameMonth(day, currentMonth)
            const selected = selectedDate && isSameDay(day, selectedDate)
            const today = isToday(day)

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(isSameDay(day, selectedDate ?? new Date('1900-01-01')) ? null : day)}
                className={`bg-bg-elevated hover:bg-bg-hover transition-colors duration-150 p-1.5 min-h-[52px] text-left ${
                  selected ? 'ring-1 ring-inset ring-gold/50' : ''
                }`}
              >
                <span className={`text-xs font-medium block mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                  today ? 'bg-gold text-bg-base' :
                  selected ? 'text-gold' :
                  inMonth ? 'text-text-secondary' : 'text-text-tertiary opacity-40'
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[e.type]}`} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-text-tertiary">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div className="space-y-2">
          <SectionHeader title={format(selectedDate, 'EEEE, MMMM d').toUpperCase()} />
          {selectedEvents.length === 0 ? (
            <p className="text-text-tertiary text-sm">Nothing on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(e => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
                  <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[e.type]} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{e.title}</p>
                    <span className={`text-[10px] uppercase tracking-wider ${TYPE_LABEL_COLORS[e.type]}`}>{e.type}</span>
                  </div>
                  {e.meta && <span className="text-text-tertiary text-xs shrink-0">{e.meta}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
