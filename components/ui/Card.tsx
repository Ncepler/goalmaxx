interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  const base =
    'rounded-xl bg-bg-elevated border border-border-subtle p-5 transition-colors'
  const interactive = onClick
    ? 'cursor-pointer hover:bg-bg-hover hover:border-border-strong'
    : ''

  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
