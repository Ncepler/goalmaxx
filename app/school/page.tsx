import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { BookOpen, Users, ChevronRight } from 'lucide-react'
import type { SchoolSubject } from '@/lib/types'

export const revalidate = 0

const DEFAULT_SUBJECTS = [
  { slug: 'english', name: 'English', kind: 'class', period: '1st period', teacher: '', sort_order: 0 },
  { slug: 'global-history', name: 'Honors Global History', kind: 'class', period: '2nd period', teacher: '', sort_order: 1 },
  { slug: 'spanish-3h', name: 'Spanish 3H', kind: 'class', period: '4th period', teacher: '', sort_order: 2 },
  { slug: 'math', name: 'Math', kind: 'class', period: '5th period', teacher: '', sort_order: 3 },
  { slug: 'science', name: 'Science', kind: 'class', period: '6th period', teacher: '', sort_order: 4 },
  { slug: 'deca', name: 'DECA', kind: 'club', period: 'Tuesdays & Thursdays', teacher: '', sort_order: 5 },
]

export default async function SchoolPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: subjects } = await supabase
    .from('school_subjects')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('sort_order')

  if (!subjects || subjects.length === 0) {
    await supabase.from('school_subjects').insert(
      DEFAULT_SUBJECTS.map(s => ({ ...s, user_id: user.id }))
    )
    const { data: seeded } = await supabase
      .from('school_subjects')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('sort_order')
    subjects = seeded
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: assignments } = await supabase
    .from('school_assignments')
    .select('subject_id, due_date')
    .eq('user_id', user.id)
    .eq('completed', false)

  const countBySubject = (assignments ?? []).reduce<Record<string, { count: number; nextDue: string | null }>>(
    (acc, a) => {
      const sid = a.subject_id
      if (!acc[sid]) acc[sid] = { count: 0, nextDue: null }
      acc[sid].count++
      if (a.due_date && (!acc[sid].nextDue || a.due_date < acc[sid].nextDue!)) {
        acc[sid].nextDue = a.due_date
      }
      return acc
    },
    {}
  )

  const classes = (subjects ?? []).filter((s: SchoolSubject) => s.kind === 'class')
  const clubs = (subjects ?? []).filter((s: SchoolSubject) => s.kind === 'club')

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-2xl">
        <SectionHeader title="CLASSES" />
        <div className="grid grid-cols-1 gap-2 mb-10">
          {classes.map((s: SchoolSubject) => (
            <SubjectCard
              key={s.id}
              subject={s}
              openCount={countBySubject[s.id]?.count ?? 0}
              nextDue={countBySubject[s.id]?.nextDue ?? null}
              today={today}
            />
          ))}
        </div>

        <SectionHeader title="CLUBS" />
        <div className="grid grid-cols-1 gap-2">
          {clubs.map((s: SchoolSubject) => (
            <SubjectCard
              key={s.id}
              subject={s}
              openCount={countBySubject[s.id]?.count ?? 0}
              nextDue={countBySubject[s.id]?.nextDue ?? null}
              today={today}
            />
          ))}
        </div>
      </div>
    </AppShell>
  )
}

function SubjectCard({
  subject,
  openCount,
  nextDue,
  today,
}: {
  subject: SchoolSubject
  openCount: number
  nextDue: string | null
  today: string
}) {
  const isOverdue = nextDue && nextDue < today

  return (
    <Link
      href={`/school/${subject.slug}`}
      className="flex items-center gap-4 rounded-xl bg-bg-elevated border border-border-subtle p-4 hover:border-border-strong hover:bg-bg-hover transition-colors"
    >
      <div className="text-text-tertiary shrink-0">
        {subject.kind === 'class' ? <BookOpen size={18} /> : <Users size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gold truncate">{subject.name}</div>
        <div className="text-xs text-text-tertiary mt-0.5">
          {subject.period ?? ''}
          {subject.teacher ? ` · ${subject.teacher}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {openCount > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOverdue ? 'bg-danger/20 text-danger' : 'text-gold'}`}>
            {openCount}
          </span>
        )}
        {nextDue && (
          <span className={`text-[10px] ${isOverdue ? 'text-danger' : 'text-text-tertiary'}`}>
            Due {format(new Date(nextDue + 'T12:00:00'), 'MMM d')}
          </span>
        )}
        <ChevronRight size={14} className="text-text-tertiary" />
      </div>
    </Link>
  )
}
