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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-bg-base/95 backdrop-blur-sm border-t border-border-subtle lg:hidden">
      <div className="flex">
        {primaryNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/main' && pathname.startsWith(href) && href !== '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors active:scale-95 active:opacity-70 ${
                active ? 'text-gold' : 'text-text-tertiary'
              }`}
            >
              {active && (
                <span className="absolute top-0 w-6 h-[2px] rounded-full bg-gold" />
              )}
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] tracking-wide uppercase font-medium">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
