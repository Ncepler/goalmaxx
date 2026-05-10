export interface RoutineItem {
  type: 'homework' | 'sat' | 'piano' | 'workout' | 'game' | 'reading' | 'other'
  title: string
  duration_min: number
  hard_time: string | null  // 'HH:MM' or null
  priority: 'low' | 'med' | 'high'
  fun?: boolean
  length?: string
  className?: string
  notes?: string
}

export interface ScheduledBlock {
  item: RoutineItem
  start: string  // 'HH:MM'
  end: string
}

export interface ScheduleResult {
  blocks: ScheduledBlock[]
  unscheduled: RoutineItem[]
  overMinutes: number
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60) % 24
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function buildSchedule(items: RoutineItem[], bedtime: string): ScheduleResult {
  const now = new Date()
  const startMinutes = now.getHours() * 60 + now.getMinutes() + 5  // 5-min buffer
  const bedtimeMinutes = timeToMinutes(bedtime)

  const blocks: ScheduledBlock[] = []
  const unscheduled: RoutineItem[] = []

  // Sort hard-time items
  const hardItems = items.filter(i => i.hard_time).sort((a, b) =>
    timeToMinutes(a.hard_time!) - timeToMinutes(b.hard_time!)
  )

  // Flexible items sorted by priority
  // Homework rule: Long+NotFun first, Short as buffer fillers, Fun items near end
  const flexItems = items.filter(i => !i.hard_time).sort((a, b) => {
    const pScore = { high: 3, med: 2, low: 1 }
    const aScore = pScore[a.priority] * 10 + (a.type === 'homework' && !a.fun && a.length === 'long' ? 5 : 0)
    const bScore = pScore[b.priority] * 10 + (b.type === 'homework' && !b.fun && b.length === 'long' ? 5 : 0)
    return bScore - aScore
  })

  // Build free time slots around hard items
  interface Slot { start: number; end: number }
  const hardBlocks: { start: number; end: number; item: RoutineItem }[] = hardItems
    .map(i => ({
      start: timeToMinutes(i.hard_time!),
      end: timeToMinutes(i.hard_time!) + i.duration_min,
      item: i,
    }))
    .filter(b => b.start >= startMinutes)

  // Place hard items
  for (const hb of hardBlocks) {
    blocks.push({ item: hb.item, start: minutesToTime(hb.start), end: minutesToTime(hb.end) })
  }

  // Build free slots
  const freeSlots: Slot[] = []
  let cursor = startMinutes

  for (const hb of hardBlocks) {
    if (cursor < hb.start) freeSlots.push({ start: cursor, end: hb.start })
    cursor = hb.end
  }
  if (cursor < bedtimeMinutes) freeSlots.push({ start: cursor, end: bedtimeMinutes })

  // Fill flex items into free slots
  for (const item of flexItems) {
    let placed = false
    for (const slot of freeSlots) {
      if (slot.end - slot.start >= item.duration_min) {
        blocks.push({ item, start: minutesToTime(slot.start), end: minutesToTime(slot.start + item.duration_min) })
        slot.start += item.duration_min
        placed = true
        break
      }
    }
    if (!placed) unscheduled.push(item)
  }

  // Sort all blocks by start time
  blocks.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))

  const totalNeeded = items.reduce((s, i) => s + i.duration_min, 0)
  const available = bedtimeMinutes - startMinutes
  const overMinutes = Math.max(0, totalNeeded - available)

  return { blocks, unscheduled, overMinutes }
}
