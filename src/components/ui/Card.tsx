import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  onClick?: () => void
}

export function Card({ children, className, elevated, onClick }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? 'card-elevated' : 'card',
        'p-5 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
