interface SectionHeaderProps {
  title: string
  className?: string
}

export function SectionHeader({ title, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 mb-4 ${className}`}>
      <div className="h-px w-6 bg-border-subtle shrink-0" />
      <span className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">
        {title}
      </span>
    </div>
  )
}
