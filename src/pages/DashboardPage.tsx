import { Plus, TrendingUp, TrendingDown, Shield, ArrowRight, Sparkles, PiggyBank, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { TransactionItem } from '../components/transactions/TransactionItem'
import { getCategory } from '../lib/categories'
import {
  formatCurrency, getMonthlyIncome, getMonthlyExpenses,
  getBudgetUsage, getGoalProgress, getMonthLabel,
} from '../lib/utils'

export function DashboardPage() {
  const {
    transactions, budgets, goals, currentMonth, balance,
    safeToSpend, insights, openTransactionModal,
  } = useApp()

  const income = getMonthlyIncome(transactions, currentMonth)
  const expenses = getMonthlyExpenses(transactions, currentMonth)
  const monthBudgets = budgets.filter((b) => b.month === currentMonth)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{getMonthLabel(currentMonth)} overview</p>
        </div>
        <Button onClick={openTransactionModal} className="hidden sm:inline-flex">
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="sm:col-span-2 gradient-brand text-white border-0 animate-slide-up stagger-1" elevated>
          <p className="text-sm text-white/80 font-medium">Total Balance</p>
          <p className="text-3xl sm:text-4xl font-bold mt-1 tabular-nums">{formatCurrency(balance)}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <Shield size={14} />
              Safe to spend today: {formatCurrency(safeToSpend)}
            </div>
          </div>
        </Card>

        <Card className="animate-slide-up stagger-2">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Income</span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{formatCurrency(income)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">This month</p>
        </Card>

        <Card className="animate-slide-up stagger-3">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <TrendingDown size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Expenses</span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{formatCurrency(expenses)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">This month</p>
        </Card>
      </div>

      {insights.length > 0 && (
        <Card className="animate-slide-up stagger-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Smart Insights</h2>
          <div className="space-y-2">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-2">
                <Badge variant={insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'success' : 'info'}>
                  {insight.type}
                </Badge>
                <p className="text-sm text-[var(--text-secondary)]">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Budget Overview</h2>
            <Link to="/budget" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {monthBudgets.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No budgets set for this month.</p>
            ) : (
              monthBudgets.slice(0, 4).map((budget) => {
                const cat = getCategory(budget.categoryId)
                const { spent, percent } = getBudgetUsage(budget, transactions)
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <ProgressBar value={spent} max={budget.limit} color={cat.color} />
                    {percent >= 85 && (
                      <p className="text-xs text-amber-500 mt-1">
                        {percent >= 100 ? 'Budget exceeded!' : 'Approaching budget limit'}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card className="animate-slide-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Savings Goals</h2>
            <Link to="/goals" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No savings goals yet.</p>
            ) : (
              goals.slice(0, 3).map((goal) => {
                const progress = getGoalProgress(goal)
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{goal.name}</span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color="#14b8a6" />
                    <p className="text-xs text-[var(--text-muted)] mt-1">{Math.round(progress)}% complete</p>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4">No transactions yet. Add your first one!</p>
          ) : (
            recentTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
