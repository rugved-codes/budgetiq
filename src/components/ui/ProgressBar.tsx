import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  color,
  showLabel,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100)
  const isOver = value > max
  const barColor = color ?? (isOver ? '#ef4444' : percent > 85 ? '#f97316' : '#6366f1')

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1.5">
          <span>{Math.round(percent)}% used</span>
          {isOver && <span className="text-red-500 font-medium">Over budget</span>}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
