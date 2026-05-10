'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarClock,
  Dumbbell,
  GraduationCap,
  Trophy,
  MoreHorizontal,
} from 'lucide-react'

const primaryNav = [
  { href: '/main', label: 'Main', icon: LayoutDashboard },
  { href: '/routine', label: 'Routine', icon: CalendarClock },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/school', label: 'School', icon: GraduationCap },
  { href: '/sports', label: 'Sports', icon: Trophy },
  { href: '/more', label: 'More', icon: MoreHorizontal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-bg-base border-t border-border-subtle lg:hidden">
      <div className="flex">
        {primaryNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/main' && pathname.startsWith(href) && href !== '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-text-tertiary hover:text-text-secondary transition-colors group"
            >
              <Icon size={20} className={active ? 'text-gold' : ''} />
              <span className="text-[10px] tracking-wide uppercase" style={{ color: active ? 'var(--gold)' : undefined }}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 block h-[1px] w-6 bg-gold" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
