import { createAdminClient } from '@/lib/supabase/server'
import { USER_ID } from '@/lib/config'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { updateProfile } from '@/app/actions/settings'
import { ShortcutSetup } from '@/components/settings/ShortcutSetup'

export const revalidate = 0

export default async function SettingsPage() {
  const supabase = createAdminClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', USER_ID).single()
  const p = (profile ?? {}) as Record<string, unknown>

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-lg space-y-6">
        <SectionHeader title="SETTINGS" />

        <form action={updateProfile} className="space-y-6">
          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
            <SectionHeader title="HYDRATION" />
            <Field label="Daily target (mL)" name="water_target_ml" type="number" defaultValue={Number(p.water_target_ml ?? 3000)} />
            <Field label="Home cup (mL)" name="cup_size_ml" type="number" defaultValue={Number(p.cup_size_ml ?? 500)} />
            <Field label="Water bottle (mL)" name="bottle_size_ml" type="number" defaultValue={Number(p.bottle_size_ml ?? 500)} />
            <Field label="Gatorade bottle (mL)" name="gatorade_size_ml" type="number" defaultValue={Number(p.gatorade_size_ml ?? 591)} />
          </div>

          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
            <SectionHeader title="FOCUS" />
            <Field label="Daily focus target (minutes)" name="focus_target_minutes" type="number" defaultValue={Number(p.focus_target_minutes ?? 240)} />
          </div>

          <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
            <SectionHeader title="SLEEP" />
            <Field label="Bedtime target" name="bedtime_target" type="time" defaultValue={String(p.bedtime_target ?? '23:00')} />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-gold text-sm font-medium hover:border-gold transition-colors duration-150"
          >
            Save settings
          </button>
        </form>

        <ShortcutSetup shortcutToken={String(p.shortcut_token ?? '')} />

        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-3">
          <SectionHeader title="OVERSEER" />
          <p className="text-text-secondary text-sm">
            Overseer is sleeping. Enable the Anthropic API to wake him.
          </p>
          <p className="text-text-tertiary text-xs">
            API key field will appear when API billing is enabled. See spec §4.17.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

function Field({
  label,
  name,
  type,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  defaultValue: string | number
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={String(defaultValue)}
        className="w-full bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-gold transition-colors duration-150"
      />
    </div>
  )
}
