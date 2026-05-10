import Link from 'next/link'
import { AppShell } from '@/components/nav/AppShell'
import {
  FolderKanban, BarChart2, DollarSign, Music, BookOpenCheck,
  BookMarked, Calendar, Smartphone, ClipboardList, Settings,
  GraduationCap, Trophy,
} from 'lucide-react'

const sections = [
  {
    label: 'Learn',
    items: [
      { href: '/school',  label: 'School',       icon: GraduationCap, desc: 'Classes, homework & notes' },
      { href: '/sat',     label: 'SAT',           icon: BookOpenCheck, desc: 'Test schedule & score trends' },
      { href: '/piano',   label: 'Piano',         icon: Music,         desc: 'Songs & practice tracker' },
      { href: '/reading', label: 'Reading',       icon: BookMarked,    desc: 'Books & articles' },
    ],
  },
  {
    label: 'Build',
    items: [
      { href: '/projects',  label: 'Projects',  icon: FolderKanban, desc: 'GitHub & task tracking' },
      { href: '/brand',     label: 'Brand',     icon: BarChart2,    desc: 'Social growth & snapshots' },
      { href: '/finances',  label: 'Finances',  icon: DollarSign,   desc: 'Subscriptions & income' },
      { href: '/sports',    label: 'Sports',    icon: Trophy,       desc: 'Teams, games & playoffs' },
    ],
  },
  {
    label: 'Review',
    items: [
      { href: '/calendar',     label: 'Calendar',     icon: Calendar,     desc: 'Everything at a glance' },
      { href: '/screen-time',  label: 'Screen Time',  icon: Smartphone,   desc: 'Daily usage log' },
      { href: '/weekly',       label: 'Weekly',       icon: ClipboardList, desc: 'Reflect & plan ahead' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings, desc: 'Hydration, sleep & shortcuts' },
    ],
  },
]

export default function MorePage() {
  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10 max-w-2xl">
        <div className="mb-8 animate-in">
          <h1 className="text-xl font-semibold text-text-primary">More</h1>
          <p className="text-sm text-text-tertiary mt-1">All features & settings</p>
        </div>

        <div className="space-y-8 stagger-list">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] tracking-[0.15em] text-text-tertiary uppercase mb-3 flex items-center gap-2">
                <span className="h-px w-5 bg-border-subtle inline-block" />
                {section.label}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {section.items.map(({ href, label, icon: Icon, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-start gap-3 rounded-xl bg-bg-elevated border border-border-subtle p-4 hover:border-border-strong hover:bg-bg-hover transition-colors group"
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-bg-base border border-border-subtle group-hover:border-gold/20 group-hover:bg-gold/5 transition-colors shrink-0">
                      <Icon size={15} className="text-text-tertiary group-hover:text-gold transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary leading-tight">{label}</div>
                      <div className="text-xs text-text-tertiary mt-0.5 leading-snug">{desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
