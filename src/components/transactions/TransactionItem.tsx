import { getCategory } from '../../lib/categories'
import { formatCurrency, formatShortDate } from '../../lib/utils'
import { CategoryIcon } from '../ui/CategoryIcon'
import type { Transaction } from '../../types'

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: (t: Transaction) => void
  onDelete?: (id: string) => void
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const category = getCategory(transaction.categoryId)
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center gap-3 py-3 group">
      <CategoryIcon icon={category.icon} color={category.color} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {category.name} · {formatShortDate(transaction.date)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
