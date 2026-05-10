import { AppShell } from '@/components/nav/AppShell'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function BrandPage() {
  return (
    <AppShell>
      <div className="px-5 pt-6">
        <SectionHeader title="BRAND" />
        <p className="text-text-tertiary text-sm">Coming in Phase 3+</p>
      </div>
    </AppShell>
  )
}
