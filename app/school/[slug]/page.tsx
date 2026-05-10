'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createAssignment, toggleAssignment, deleteAssignment, createLink, deleteLink, updateNotes } from '@/app/actions/school'
import { format } from 'date-fns'
import { ExternalLink, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { SchoolSubject, SchoolLink, SchoolAssignment } from '@/lib/types'

export default function SchoolDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [subject, setSubject] = useState<SchoolSubject | null>(null)
  const [links, setLinks] = useState<SchoolLink[]>([])
  const [assignments, setAssignments] = useState<SchoolAssignment[]>([])
  const [notes, setNotes] = useState('')
  const [notesDirty, setNotesDirty] = useState(false)
  const [showAddLink, setShowAddLink] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [, startTransition] = useTransition()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: subj } = await supabase
        .from('school_subjects')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!subj) return
      setSubject(subj)
      setNotes(subj.notes_md ?? '')

      const [{ data: lnks }, { data: asgn }] = await Promise.all([
        supabase.from('school_links').select('*').eq('subject_id', subj.id).order('sort_order'),
        supabase.from('school_assignments').select('*').eq('subject_id', subj.id).order('due_date'),
      ])
      setLinks(lnks ?? [])
      setAssignments(asgn ?? [])
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function handleSaveNotes() {
    if (!subject) return
    await updateNotes(subject.id, notes)
    setNotesDirty(false)
  }

  if (!subject) {
    return (
      <AppShell>
        <div className="px-5 pt-6 text-text-tertiary text-sm">Loading…</div>
      </AppShell>
    )
  }

  const open = assignments.filter(a => !a.completed)
  const completed = assignments.filter(a => a.completed)
  const isClub = subject.kind === 'club'

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-2xl space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gold">{subject.name}</h1>
          {subject.teacher && <p className="text-sm text-text-secondary mt-1">{subject.teacher}</p>}
          {subject.period && <p className="text-xs text-text-tertiary mt-0.5">{subject.period}</p>}
        </div>

        {/* Pinned Links */}
        <div>
          <SectionHeader title="PINNED LINKS" />
          <div className="space-y-2">
            {links.map(link => (
              <div key={link.id} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3">
                <span className="text-lg">{link.icon ?? '🔗'}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-text-primary hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-text-secondary">
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => startTransition(() => deleteLink(link.id, slug))}
                  className="text-text-tertiary hover:text-danger transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {showAddLink ? (
              <form
                action={async (fd) => { await createLink(fd); setShowAddLink(false) }}
                className="rounded-xl bg-bg-elevated border border-border-strong p-4 space-y-2"
              >
                <input type="hidden" name="subject_id" value={subject.id} />
                <div className="flex gap-2">
                  <input name="icon" placeholder="🔗" className="w-12 text-center rounded-lg bg-bg-input border border-border-subtle px-2 py-1.5 text-sm focus:outline-none" />
                  <input name="label" placeholder="Label (e.g. Notes Doc)" required className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong" />
                </div>
                <input name="url" placeholder="https://…" required className="w-full rounded-lg bg-bg-input border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong" />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-bg-hover border border-border-strong text-gold text-sm">Save</button>
                  <button type="button" onClick={() => setShowAddLink(false)} className="text-text-tertiary text-sm px-2">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddLink(true)} className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
                <Plus size={14} /> Add link
              </button>
            )}
          </div>
        </div>

        {/* Assignments / Action Items */}
        <div>
          <SectionHeader title={isClub ? 'ACTION ITEMS' : 'HOMEWORK'} />
          <div className="space-y-1.5">
            {open.map(a => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                onToggle={() => startTransition(() => toggleAssignment(a.id, true).then(() => setAssignments(prev => prev.map(x => x.id === a.id ? { ...x, completed: true } : x))))}
                onDelete={() => startTransition(() => deleteAssignment(a.id).then(() => setAssignments(prev => prev.filter(x => x.id !== a.id))))}
              />
            ))}

            {showAddAssignment ? (
              <form
                action={async (fd) => { await createAssignment(fd); setShowAddAssignment(false) }}
                className="rounded-xl bg-bg-elevated border border-border-strong p-4 space-y-2"
              >
                <input type="hidden" name="subject_id" value={subject.id} />
                <input name="title" placeholder={isClub ? 'Action item…' : 'Assignment title…'} required autoFocus className="w-full rounded-lg bg-bg-input border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong" />
                <div className="flex gap-2">
                  <input type="date" name="due_date" className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-border-strong" />
                  {!isClub && (
                    <>
                      <select name="length" className="rounded-lg bg-bg-input border border-border-subtle px-2 py-1.5 text-sm text-text-primary focus:outline-none">
                        <option value="short">Short ≤20m</option>
                        <option value="medium" selected>Medium 20-45m</option>
                        <option value="long">Long 45m+</option>
                      </select>
                      <select name="fun" className="rounded-lg bg-bg-input border border-border-subtle px-2 py-1.5 text-sm text-text-primary focus:outline-none">
                        <option value="false">Not fun</option>
                        <option value="true">Fun ✨</option>
                      </select>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-bg-hover border border-border-strong text-gold text-sm">Add</button>
                  <button type="button" onClick={() => setShowAddAssignment(false)} className="text-text-tertiary text-sm px-2">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddAssignment(true)} className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors mt-2">
                <Plus size={14} /> Add {isClub ? 'action item' : 'assignment'}
              </button>
            )}
          </div>

          {completed.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showCompleted ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {completed.length} completed
              </button>
              {showCompleted && (
                <div className="mt-2 space-y-1 opacity-50">
                  {completed.map(a => (
                    <div key={a.id} className="flex items-center gap-2 py-1.5 text-sm text-text-tertiary line-through">
                      <Check size={12} className="text-success" />
                      {a.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <SectionHeader title="NOTES" />
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesDirty(true) }}
            placeholder="Running notes, important dates, contact info…"
            rows={8}
            className="w-full rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong resize-none font-mono leading-relaxed"
          />
          {notesDirty && (
            <button onClick={handleSaveNotes} className="mt-2 px-4 py-1.5 rounded-lg bg-bg-hover border border-border-strong text-gold text-sm">
              Save notes
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function AssignmentRow({
  assignment: a,
  onToggle,
  onDelete,
}: {
  assignment: SchoolAssignment
  onToggle: () => void
  onDelete: () => void
}) {
  const isOverdue = a.due_date && a.due_date < format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex items-center gap-3 rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2.5">
      <button onClick={onToggle} className="w-4 h-4 rounded border-2 border-border-strong hover:border-success shrink-0 flex items-center justify-center transition-colors" />
      <span className="flex-1 text-sm text-text-primary">{a.title}</span>
      <div className="flex items-center gap-2 shrink-0">
        {a.length && <span className="text-[10px] text-text-tertiary uppercase">{a.length}</span>}
        {a.fun && <span className="text-[10px] text-gold">fun</span>}
        {a.due_date && (
          <span className={`text-[10px] ${isOverdue ? 'text-danger font-medium' : 'text-text-tertiary'}`}>
            {format(new Date(a.due_date + 'T12:00:00'), 'MMM d')}
          </span>
        )}
        <button onClick={onDelete} className="text-text-tertiary hover:text-danger transition-colors"><Trash2 size={12} /></button>
      </div>
    </div>
  )
}
