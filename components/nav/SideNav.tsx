'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarClock,
  Dumbbell,
  GraduationCap,
  Trophy,
  FolderKanban,
  BarChart2,
  DollarSign,
  Music,
  BookOpenCheck,
  BookMarked,
  Calendar,
  Smartphone,
  ClipboardList,
  Settings,
} from 'lucide-react'

const navGroups = [
  {
    items: [
      { href: '/main', label: 'Main', icon: LayoutDashboard },
      { href: '/routine', label: 'Routine', icon: CalendarClock },
    ],
  },
  {
    label: 'Train',
    items: [
      { href: '/workout', label: 'Workout', icon: Dumbbell },
      { href: '/school', label: 'School', icon: GraduationCap },
      { href: '/sports', label: 'Sports', icon: Trophy },
      { href: '/sat', label: 'SAT', icon: BookOpenCheck },
      { href: '/piano', label: 'Piano', icon: Music },
    ],
  },
  {
    label: 'Track',
    items: [
      { href: '/projects', label: 'Projects', icon: FolderKanban },
      { href: '/brand', label: 'Brand', icon: BarChart2 },
      { href: '/finances', label: 'Finances', icon: DollarSign },
      { href: '/reading', label: 'Reading', icon: BookMarked },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
      { href: '/screen-time', label: 'Screen Time', icon: Smartphone },
      { href: '/weekly', label: 'Weekly', icon: ClipboardList },
    ],
  },
  {
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex flex-col w-56 shrink-0 h-full fixed left-0 top-0 bg-bg-base border-r border-border-subtle overflow-y-auto py-6">
      <div className="px-6 mb-8">
        <span className="text-sm font-bold tracking-widest text-gold uppercase">GoalMaxx</span>
      </div>

      <div className="flex-1 px-3 space-y-6">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-2 text-[10px] tracking-[0.15em] text-text-tertiary uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/main' && pathname.startsWith(href))
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-bg-elevated text-gold border-l-[1px] border-gold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
