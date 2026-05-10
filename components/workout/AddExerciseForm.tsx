'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { createExercise } from '@/app/actions/workout'

export function AddExerciseForm() {
  const [open, setOpen] = useState(false)

  if (!open) return (
    <div>
      <SectionHeader title="EXERCISES" />
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <Plus size={14} /> Add exercise
      </button>
    </div>
  )

  return (
    <div>
      <SectionHeader title="ADD EXERCISE" />
      <form action={createExercise} onSubmit={() => setOpen(false)} className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-3">
        <input name="name" placeholder="Exercise name" required className="w-full rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong" />
        <div className="flex gap-2">
          <input name="muscle_group" placeholder="Muscle group" className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong" />
          <input name="weight_increment_kg" placeholder="Increment kg" type="number" step="0.5" defaultValue="2.5" className="w-32 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-strong" />
        </div>
        <div className="flex gap-2">
          <input name="rep_range_low" placeholder="Rep min" type="number" defaultValue="6" className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-strong" />
          <input name="rep_range_high" placeholder="Rep max" type="number" defaultValue="8" className="flex-1 rounded-lg bg-bg-input border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-strong" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-bg-hover border border-border-strong text-gold text-sm font-medium">Add</button>
          <button type="button" onClick={() => setOpen(false)} className="text-text-tertiary text-sm px-2">Cancel</button>
        </div>
      </form>
    </div>
  )
}
