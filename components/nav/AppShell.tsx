import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <SideNav />
      <main className="lg:ml-56 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
