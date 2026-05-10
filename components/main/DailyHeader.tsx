import { AlertTriangle, Flame } from 'lucide-react'
import { format } from 'date-fns'

interface DailyHeaderProps {
  date: string
  score: number
  sleepPercent: number
  longestStreak: number
  sleepBelowTarget: boolean
}

export function DailyHeader({
  date,
  score,
  sleepPercent,
  longestStreak,
  sleepBelowTarget,
}: DailyHeaderProps) {
  const dateLabel = format(new Date(date + 'T12:00:00'), 'EEE, MMM d').toUpperCase()

  return (
    <div className="px-5 pt-6 pb-4 border-b border-border-subtle animate-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-1">
            {dateLabel}
          </p>
          <h1 className="text-[11px] tracking-[0.15em] font-medium text-text-secondary uppercase">
            GOALMAXX
          </h1>
        </div>

        {/* Score pill */}
        <div className="text-right">
          <div className="text-4xl font-black tabular-nums text-gold leading-none">{score}</div>
          <div className="text-[10px] tracking-[0.15em] text-text-tertiary uppercase mt-1">Score</div>
        </div>
      </div>

      {/* Stat row */}
      <div className="flex gap-4">
        <StatChip
          label="Sleep"
          value={`${Math.round(sleepPercent)}%`}
          highlight={sleepPercent >= 87.5}
          warn={sleepPercent < 75}
        />
        {longestStreak > 0 && (
          <StatChip
            label="Streak"
            value={`${longestStreak}d`}
            icon={<Flame size={11} className="text-warning" />}
          />
        )}
      </div>

      {/* Status flags */}
      {sleepBelowTarget && (
        <div className="mt-3 flex items-center gap-2 text-xs text-warning">
          <AlertTriangle size={12} />
          Sleep below target last night
        </div>
      )}
    </div>
  )
}

function StatChip({
  label,
  value,
  highlight,
  warn,
  icon,
}: {
  label: string
  value: string
  highlight?: boolean
  warn?: boolean
  icon?: React.ReactNode
}) {
  const color = warn ? 'text-warning' : highlight ? 'text-success' : 'text-text-secondary'
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-bg-elevated border border-border-subtle px-3 py-1">
      {icon}
      <span className="text-[10px] tracking-[0.1em] text-text-tertiary uppercase">{label}</span>
      <span className={`text-[11px] font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
