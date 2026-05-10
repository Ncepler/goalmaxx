interface ProgressBarProps {
  value: number      // 0–1
  color?: 'gold' | 'success' | 'warning' | 'danger'
  className?: string
}

export function ProgressBar({ value, color = 'gold', className = '' }: ProgressBarProps) {
  const fillColors = {
    gold: 'bg-gold-dim',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className={`h-1 w-full rounded-full bg-bg-input overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${fillColors[color]}`}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  )
}
