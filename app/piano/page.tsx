'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { addSong, setSongStatus, deleteSong } from '@/app/actions/piano'
import { ExternalLink, Plus, Check, Trash2, Music } from 'lucide-react'
import type { Database } from '@/lib/types'

type Song = Database['public']['Tables']['piano_songs']['Row']

export default function PianoPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [, startTransition] = useTransition()
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('piano_songs').select('*').order('added_at', { ascending: false })
    setSongs(data ?? [])
  }

  useEffect(() => { load() }, [])

  const current = songs.find(s => s.is_current)
  const learning = songs.filter(s => s.status === 'learning' && !s.is_current)
  const want = songs.filter(s => s.status === 'want')
  const learned = songs.filter(s => s.status === 'learned')

  async function handleSetStatus(id: string, status: 'want' | 'learning' | 'learned') {
    startTransition(async () => {
      await setSongStatus(id, status)
      await load()
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSong(id)
      await load()
    })
  }

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addSong(formData)
      await load()
      setShowAdd(false)
    })
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-xl space-y-8">
        <div className="flex items-center justify-between">
          <SectionHeader title="PIANO" className="mb-0" />
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-150"
          >
            <Plus size={14} />
            Add song
          </button>
        </div>

        {showAdd && (
          <form
            action={handleAdd}
            className="rounded-xl bg-bg-elevated border border-border-subtle p-4 space-y-3"
          >
            <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">New song</p>
            <input name="title" placeholder="Song title" required className={inputCls} />
            <input name="artist" placeholder="Artist (optional)" className={inputCls} />
            <input name="tiktok_url" placeholder="TikTok tutorial URL (optional)" className={inputCls} />
            <div className="flex gap-2 pt-1">
              <button type="submit" className={btnGold}>Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className={btnGhost}>Cancel</button>
            </div>
          </form>
        )}

        {current && (
          <>
            <SectionHeader title="CURRENTLY LEARNING" />
            <SongRow song={current} onStatus={handleSetStatus} onDelete={handleDelete} highlight />
          </>
        )}

        {want.length > 0 && (
          <>
            <SectionHeader title="WANT TO LEARN" />
            <div className="space-y-2">
              {want.map(s => (
                <SongRow key={s.id} song={s} onStatus={handleSetStatus} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}

        {learning.length > 0 && (
          <>
            <SectionHeader title="ALSO LEARNING" />
            <div className="space-y-2">
              {learning.map(s => (
                <SongRow key={s.id} song={s} onStatus={handleSetStatus} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}

        {learned.length > 0 && (
          <>
            <SectionHeader title="LEARNED" />
            <div className="space-y-2 opacity-60">
              {learned.map(s => (
                <SongRow key={s.id} song={s} onStatus={handleSetStatus} onDelete={handleDelete} dimmed />
              ))}
            </div>
          </>
        )}

        {songs.length === 0 && (
          <p className="text-text-tertiary text-sm">No songs yet. Add one above.</p>
        )}
      </div>
    </AppShell>
  )
}

function SongRow({
  song,
  onStatus,
  onDelete,
  highlight,
  dimmed,
}: {
  song: Song
  onStatus: (id: string, s: 'want' | 'learning' | 'learned') => void
  onDelete: (id: string) => void
  highlight?: boolean
  dimmed?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 transition-colors duration-150 ${highlight ? 'bg-gold/5 border-gold/30' : 'bg-bg-elevated border-border-subtle hover:border-border-strong'}`}>
      <Music size={16} className={highlight ? 'text-gold' : 'text-text-tertiary'} />
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${dimmed ? 'text-text-tertiary' : 'text-text-primary'}`}>
          {song.title}
          {song.status === 'learned' && <Check size={12} className="inline ml-1.5 text-success" />}
        </p>
        {song.artist && <p className="text-xs text-text-tertiary truncate">{song.artist}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {song.tiktok_url && (
          <a href={song.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-gold transition-colors duration-150">
            <ExternalLink size={13} />
          </a>
        )}

        {song.status === 'want' && (
          <button
            onClick={() => onStatus(song.id, 'learning')}
            className="text-[10px] text-gold border border-gold/30 rounded-full px-2 py-0.5 hover:bg-gold/10 transition-colors duration-150"
          >
            Learn
          </button>
        )}
        {song.status === 'learning' && (
          <button
            onClick={() => onStatus(song.id, 'learned')}
            className="text-[10px] text-success border border-success/30 rounded-full px-2 py-0.5 hover:bg-success/10 transition-colors duration-150"
          >
            Mark learned
          </button>
        )}
        {song.status === 'learned' && (
          <button
            onClick={() => onStatus(song.id, 'want')}
            className="text-[10px] text-text-tertiary border border-border-subtle rounded-full px-2 py-0.5 hover:text-text-secondary transition-colors duration-150"
          >
            Relearn
          </button>
        )}

        <button onClick={() => onDelete(song.id)} className="text-text-tertiary hover:text-danger transition-colors duration-150">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-gold transition-colors duration-150'
const btnGold = 'px-4 py-1.5 rounded-lg bg-bg-input border border-gold/40 text-gold text-sm hover:border-gold transition-colors duration-150'
const btnGhost = 'px-4 py-1.5 rounded-lg bg-bg-input border border-border-subtle text-text-secondary text-sm hover:border-border-strong transition-colors duration-150'
