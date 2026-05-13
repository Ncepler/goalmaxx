import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { AppShell } from '@/components/nav/AppShell'
import { CalendarClient } from '@/components/calendar/CalendarClient'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'

export const revalidate = 0

export default async function CalendarPage() {
  const supabase = createAdminClient()

  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd')

  const [
    { data: tasks },
    { data: satTests },
    { data: myGames },
    { data: subscriptions },
    { data: assignments },
  ] = await Promise.all([
    supabase.from('tasks').select('id, title, due_date, completed').eq('user_id', USER_ID)
      .gte('due_date', monthStart).lte('due_date', monthEnd),
    supabase.from('sat_tests').select('id, scheduled_for, is_practice, total_score').eq('user_id', USER_ID)
      .gte('scheduled_for', monthStart).lte('scheduled_for', monthEnd),
    supabase.from('my_games').select('id, sport, scheduled_for, opponent, result').eq('user_id', USER_ID)
      .gte('scheduled_for', monthStart).lte('scheduled_for', monthEnd),
    supabase.from('subscriptions').select('id, service, cost, next_charge_date').eq('user_id', USER_ID)
      .gte('next_charge_date', monthStart).lte('next_charge_date', monthEnd),
    supabase.from('school_assignments').select('id, title, due_date, subject_id').eq('user_id', USER_ID)
      .eq('completed', false).gte('due_date', monthStart).lte('due_date', monthEnd),
  ])

  type CalEvent = {
    id: string
    date: string
    title: string
    type: 'task' | 'sat' | 'game' | 'sub' | 'homework'
    meta?: string
  }

  const events: CalEvent[] = [
    ...(tasks ?? []).map(t => ({
      id: t.id,
      date: t.due_date,
      title: t.title,
      type: 'task' as const,
      meta: t.completed ? 'done' : undefined,
    })),
    ...(satTests ?? []).map(t => ({
      id: t.id,
      date: t.scheduled_for.split('T')[0],
      title: t.is_practice ? 'Practice SAT' : 'Real SAT',
      type: 'sat' as const,
      meta: t.total_score ? String(t.total_score) : undefined,
    })),
    ...(myGames ?? []).map(g => ({
      id: g.id,
      date: g.scheduled_for.split('T')[0],
      title: `${g.sport}${g.opponent ? ` vs ${g.opponent}` : ''}`,
      type: 'game' as const,
      meta: g.result ?? undefined,
    })),
    ...(subscriptions ?? []).filter(s => s.next_charge_date).map(s => ({
      id: s.id,
      date: s.next_charge_date!,
      title: `${s.service} renewal`,
      type: 'sub' as const,
      meta: `$${s.cost}`,
    })),
    ...(assignments ?? []).filter(a => a.due_date).map(a => ({
      id: a.id,
      date: a.due_date!,
      title: a.title,
      type: 'homework' as const,
    })),
  ]

  return (
    <AppShell>
      <CalendarClient events={events} />
    </AppShell>
  )
}
