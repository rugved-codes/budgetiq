import { useState } from 'react'
import { AlertTriangle, Sparkles, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { EXPENSE_CATEGORIES, getCategory } from '../lib/categories'
import { formatCurrency, getBudgetUsage, getMonthLabel } from '../lib/utils'

export function BudgetPage() {
  const { budgets, transactions, currentMonth, setBudget, suggestBudget } = useApp()
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState('')

  const monthBudgets = budgets.filter((b) => b.month === currentMonth)

  const openEdit = (categoryId: string) => {
    const existing = monthBudgets.find((b) => b.categoryId === categoryId)
    setEditingCategory(categoryId)
    setEditLimit(existing ? String(existing.limit) : '')
  }

  const handleSave = () => {
    if (!editingCategory) return
    const limit = parseFloat(editLimit)
    if (!limit || limit <= 0) return
    setBudget(editingCategory, limit)
    setEditingCategory(null)
  }

  const handleSuggest = () => {
    if (!editingCategory) return
    const suggested = suggestBudget(editingCategory)
    if (suggested > 0) setEditLimit(String(suggested))
  }

  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = monthBudgets.reduce((s, b) => s + getBudgetUsage(b, transactions).spent, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budget</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{getMonthLabel(currentMonth)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Total Budget</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-[var(--text-primary)]">{formatCurrency(totalBudget)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Total Spent</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-[var(--text-primary)]">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Remaining</p>
          <p className={`text-2xl font-bold tabular-nums mt-1 ${totalBudget - totalSpent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPENSE_CATEGORIES.map((cat) => {
          const budget = monthBudgets.find((b) => b.categoryId === cat.id)
          const { spent, percent } = budget
            ? getBudgetUsage(budget, transactions)
            : { spent: 0, percent: 0 }
          const isOver = budget && spent > budget.limit
          const isWarning = budget && percent >= 85 && !isOver

          return (
            <Card key={cat.id} className="relative">
              <div className="flex items-start gap-3">
                <CategoryIcon icon={cat.icon} color={cat.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{cat.name}</h3>
                    <button
                      onClick={() => openEdit(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-pointer transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>

                  {budget ? (
                    <>
                      <div className="flex items-center justify-between mt-2 mb-2">
                        <span className="text-xs text-[var(--text-muted)] tabular-nums">
                          {formatCurrency(spent)} of {formatCurrency(budget.limit)}
                        </span>
                        <span className="text-xs font-medium tabular-nums" style={{ color: cat.color }}>
                          {Math.round(percent)}%
                        </span>
                      </div>
                      <ProgressBar value={spent} max={budget.limit} color={cat.color} />
                      {isOver && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                          <AlertTriangle size={12} />
                          Over budget by {formatCurrency(spent - budget.limit)}
                        </div>
                      )}
                      {isWarning && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500">
                          <AlertTriangle size={12} />
                          Approaching budget limit
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs text-[var(--text-muted)] mb-2">No budget set</p>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(cat.id)}>
                        Set Budget
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={`Set ${editingCategory ? getCategory(editingCategory).name : ''} Budget`}
      >
        <div className="space-y-4">
          <Input
            label="Monthly Limit"
            type="number"
            step="1"
            min="1"
            placeholder="0.00"
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            autoFocus
          />
          <Button variant="secondary" size="sm" onClick={handleSuggest} className="w-full">
            <Sparkles size={14} />
            Suggest based on spending history
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
