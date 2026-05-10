'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { addBook, logReadingSession, addArticle } from '@/app/actions/reading'
import { format, parseISO } from 'date-fns'
import { Plus, BookOpen, ExternalLink, Repeat } from 'lucide-react'
import type { Database } from '@/lib/types'

type Book = Database['public']['Tables']['books']['Row']
type Article = Database['public']['Tables']['articles']['Row']
type Session = Database['public']['Tables']['reading_sessions']['Row']

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [tab, setTab] = useState<'books' | 'articles'>('books')
  const [showAddBook, setShowAddBook] = useState(false)
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [loggingBookId, setLoggingBookId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const supabase = createClient()

  async function load() {
    const [{ data: b }, { data: a }, { data: s }] = await Promise.all([
      supabase.from('books').select('*').order('started_at', { ascending: false }),
      supabase.from('articles').select('*').order('read_at', { ascending: false }),
      supabase.from('reading_sessions').select('*').gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]),
    ])
    setBooks(b ?? [])
    setArticles(a ?? [])
    setSessions(s ?? [])
  }

  useEffect(() => { load() }, [])

  const activeBooks = books.filter(b => !b.finished_at)
  const finishedBooks = books.filter(b => b.finished_at)

  const weekPages = sessions.reduce((s, r) => s + (r.pages ?? 0), 0)
  const weekMinutes = sessions.reduce((s, r) => s + (r.minutes ?? 0), 0)

  async function handleAddBook(fd: FormData) {
    startTransition(async () => { await addBook(fd); await load(); setShowAddBook(false) })
  }
  async function handleLogSession(fd: FormData) {
    startTransition(async () => { await logReadingSession(fd); await load(); setLoggingBookId(null) })
  }
  async function handleAddArticle(fd: FormData) {
    startTransition(async () => { await addArticle(fd); await load(); setShowAddArticle(false) })
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
            <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">Pages this week</p>
            <p className="text-gold font-bold text-2xl tabular-nums">{weekPages}</p>
          </div>
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
            <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1">Minutes this week</p>
            <p className="text-gold font-bold text-2xl tabular-nums">{weekMinutes}</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-bg-elevated border border-border-subtle rounded-lg p-1">
          {(['books', 'articles'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors duration-150 ${tab === t ? 'bg-bg-input text-gold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'books' && (
          <>
            <div className="flex items-center justify-between">
              <SectionHeader title="BOOKS" className="mb-0" />
              <button onClick={() => setShowAddBook(v => !v)} className={addBtn}>
                <Plus size={14} /> Add book
              </button>
            </div>

            {showAddBook && (
              <form action={handleAddBook} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
                <input name="title" placeholder="Title" required className={inputCls} />
                <input name="author" placeholder="Author" className={inputCls} />
                <input name="total_pages" type="number" placeholder="Total pages" className={inputCls} />
                <div className="flex gap-2">
                  <button type="submit" className={btnGold}>Add</button>
                  <button type="button" onClick={() => setShowAddBook(false)} className={btnGhost}>Cancel</button>
                </div>
              </form>
            )}

            {activeBooks.length > 0 && (
              <>
                <SectionHeader title="CURRENTLY READING" />
                <div className="space-y-3">
                  {activeBooks.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onLog={() => setLoggingBookId(loggingBookId === book.id ? null : book.id)}
                      logOpen={loggingBookId === book.id}
                      onLogSubmit={handleLogSession}
                    />
                  ))}
                </div>
              </>
            )}

            {finishedBooks.length > 0 && (
              <>
                <SectionHeader title="FINISHED" />
                <div className="space-y-2 opacity-70">
                  {finishedBooks.map(book => (
                    <div key={book.id} className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-border-subtle p-3">
                      <BookOpen size={14} className="text-success shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{book.title}</p>
                        {book.author && <p className="text-xs text-text-tertiary">{book.author}</p>}
                      </div>
                      {book.finished_at && (
                        <span className="text-xs text-text-tertiary shrink-0">{format(parseISO(book.finished_at), 'MMM d')}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {books.length === 0 && <p className="text-text-tertiary text-sm">No books yet.</p>}
          </>
        )}

        {tab === 'articles' && (
          <>
            <div className="flex items-center justify-between">
              <SectionHeader title="ARTICLES" className="mb-0" />
              <button onClick={() => setShowAddArticle(v => !v)} className={addBtn}>
                <Plus size={14} /> Log article
              </button>
            </div>

            {showAddArticle && (
              <form action={handleAddArticle} className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
                <input name="url" type="url" placeholder="URL" required className={inputCls} />
                <input name="title" placeholder="Title (optional)" className={inputCls} />
                <input name="source" placeholder="Source (e.g. NY Times)" className={inputCls} />
                <input name="minutes_spent" type="number" placeholder="Minutes spent" className={inputCls} />
                <input name="takeaway" placeholder="Key takeaway" className={inputCls} />
                <div className="flex gap-2">
                  <button type="submit" className={btnGold}>Log</button>
                  <button type="button" onClick={() => setShowAddArticle(false)} className={btnGhost}>Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {articles.map(a => (
                <div key={a.id} className="rounded-xl bg-bg-elevated border border-border-subtle p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-text-primary text-sm font-medium hover:text-gold transition-colors duration-150 flex items-center gap-1">
                        {a.title ?? a.url}
                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                      <div className="flex items-center gap-2 mt-0.5">
                        {a.source && <span className="text-xs text-text-tertiary">{a.source}</span>}
                        {a.minutes_spent && <span className="text-xs text-text-tertiary">{a.minutes_spent}m</span>}
                        {a.read_at && <span className="text-xs text-text-tertiary">{format(parseISO(a.read_at as string), 'MMM d')}</span>}
                      </div>
                      {a.takeaway && <p className="text-xs text-text-secondary mt-1.5 italic">&ldquo;{a.takeaway}&rdquo;</p>}
                    </div>
                    <button
                      onClick={async () => {
                        const fd = new FormData()
                        fd.set('url', a.url)
                        fd.set('title', a.title ?? '')
                        fd.set('source', a.source ?? '')
                        await addArticle(fd)
                        await load()
                      }}
                      title="Log again"
                      className="text-text-tertiary hover:text-gold transition-colors duration-150 shrink-0"
                    >
                      <Repeat size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p className="text-text-tertiary text-sm">No articles logged yet.</p>}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function BookCard({
  book,
  onLog,
  logOpen,
  onLogSubmit,
}: {
  book: Book
  onLog: () => void
  logOpen: boolean
  onLogSubmit: (fd: FormData) => void
}) {
  const pct = book.total_pages && book.current_page
    ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
    : null

  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium truncate">{book.title}</p>
          {book.author && <p className="text-xs text-text-tertiary">{book.author}</p>}
          {book.current_page !== null && book.total_pages && (
            <p className="text-xs text-text-secondary mt-1">
              Page <span className="text-gold">{book.current_page}</span> / {book.total_pages}
            </p>
          )}
        </div>
        <button
          onClick={onLog}
          className="text-xs text-gold border border-gold/30 rounded-full px-2 py-0.5 hover:bg-gold/10 transition-colors duration-150 shrink-0"
        >
          Log session
        </button>
      </div>

      {pct !== null && (
        <div className="h-1 bg-bg-input rounded-full overflow-hidden">
          <div className="h-full bg-gold-dim rounded-full" style={{ width: `${pct}%` }} />
        </div>
      )}

      {logOpen && (
        <form action={onLogSubmit} className="pt-2 border-t border-border-subtle space-y-3">
          <input type="hidden" name="book_id" value={book.id} />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Pages</label>
              <input name="pages" type="number" min={0} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Minutes</label>
              <input name="minutes" type="number" min={0} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Current page</label>
              <input name="current_page" type="number" min={0} placeholder={String(book.current_page ?? 0)} className={inputCls} />
            </div>
          </div>
          <button type="submit" className={btnGold}>Save session</button>
        </form>
      )}
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const labelCls = 'block text-[11px] font-medium tracking-[0.12em] text-text-secondary uppercase mb-1'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
const addBtn = 'flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150'
