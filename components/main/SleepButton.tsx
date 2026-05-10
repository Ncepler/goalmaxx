'use client'

import { useTransition } from 'react'
import { Moon, Sun } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { startSleep, endSleep } from '@/app/actions/sleep'
import { formatDuration } from '@/lib/score'
import type { SleepLog } from '@/lib/types'

interface SleepButtonProps {
  activeSleepLog: SleepLog | null   // open log (no sleep_end)
  lastCompletedLog: SleepLog | null  // most recent completed log
  sevenDayAvgMinutes: number
}

export function SleepButton({ activeSleepLog, lastCompletedLog, sevenDayAvgMinutes }: SleepButtonProps) {
  const [, startTransition] = useTransition()

  const isSleeping = !!activeSleepLog

  function handleToggle() {
    startTransition(async () => {
      if (isSleeping && activeSleepLog) {
        await endSleep(activeSleepLog.id)
      } else {
        await startSleep()
      }
    })
  }

  return (
    <div>
      <SectionHeader title="SLEEP" />

      <button
        onClick={handleToggle}
        className={`w-full rounded-xl border p-5 flex items-center gap-4 transition-colors ${
          isSleeping
            ? 'bg-bg-elevated border-gold-dim hover:border-gold text-gold'
            : 'bg-bg-elevated border-border-subtle hover:border-border-strong text-text-primary'
        }`}
      >
        {isSleeping ? (
          <>
            <Sun size={22} className="text-gold shrink-0" />
            <div className="text-left">
              <div className="font-semibold">Just woke up</div>
              <div className="text-xs text-text-secondary mt-0.5">
                Tap to record wake time &amp; save sleep log
              </div>
            </div>
          </>
        ) : (
          <>
            <Moon size={22} className="text-text-secondary shrink-0" />
            <div className="text-left">
              <div className="font-medium text-text-primary">Going to bed</div>
              <div className="text-xs text-text-secondary mt-0.5">
                Tap to start tracking sleep
              </div>
            </div>
          </>
        )}
      </button>

      {/* Stats below */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {lastCompletedLog?.duration_minutes && (
          <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
            <div className="text-[10px] tracking-[0.1em] text-text-tertiary uppercase mb-1">Last night</div>
            <div className="text-xl font-bold text-gold tabular-nums">
              {formatDuration(lastCompletedLog.duration_minutes)}
            </div>
          </div>
        )}
        {sevenDayAvgMinutes > 0 && (
          <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
            <div className="text-[10px] tracking-[0.1em] text-text-tertiary uppercase mb-1">7-day avg</div>
            <div className="text-xl font-bold tabular-nums" style={{
              color: sevenDayAvgMinutes >= 420 ? 'var(--success)' : 'var(--warning)'
            }}>
              {formatDuration(sevenDayAvgMinutes)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
