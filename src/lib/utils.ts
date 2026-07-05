import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, getDaysInMonth } from 'date-fns'
import type { Transaction, Budget, Goal } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy')
}

export function formatShortDate(date: string): string {
  return format(parseISO(date), 'MMM d')
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function getMonthLabel(month: string): string {
  return format(parseISO(`${month}-01`), 'MMMM yyyy')
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)
}

export function getMonthlyIncome(transactions: Transaction[], month: string): number {
  const start = startOfMonth(parseISO(`${month}-01`))
  const end = endOfMonth(start)
  return transactions
    .filter((t) => t.type === 'income' && isWithinInterval(parseISO(t.date), { start, end }))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getMonthlyExpenses(transactions: Transaction[], month: string): number {
  const start = startOfMonth(parseISO(`${month}-01`))
  const end = endOfMonth(start)
  return transactions
    .filter((t) => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getCategorySpending(transactions: Transaction[], month: string, categoryId: string): number {
  const start = startOfMonth(parseISO(`${month}-01`))
  const end = endOfMonth(start)
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.categoryId === categoryId &&
        isWithinInterval(parseISO(t.date), { start, end })
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBudgetUsage(budget: Budget, transactions: Transaction[]): { spent: number; percent: number } {
  const spent = getCategorySpending(transactions, budget.month, budget.categoryId)
  const percent = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0
  return { spent, percent }
}

export function getGoalProgress(goal: Goal): number {
  return goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
}

export function getSafeToSpendToday(
  transactions: Transaction[],
  budgets: Budget[],
  month: string
): number {
  const today = new Date()
  const daysInMonth = getDaysInMonth(today)
  const dayOfMonth = today.getDate()
  const daysRemaining = daysInMonth - dayOfMonth + 1

  const totalBudget = budgets
    .filter((b) => b.month === month)
    .reduce((sum, b) => sum + b.limit, 0)

  const totalSpent = getMonthlyExpenses(transactions, month)
  const remaining = Math.max(totalBudget - totalSpent, 0)

  return daysRemaining > 0 ? remaining / daysRemaining : 0
}

export function getMonthlySpendingByCategory(
  transactions: Transaction[],
  month: string
): Record<string, number> {
  const start = startOfMonth(parseISO(`${month}-01`))
  const end = endOfMonth(start)
  const result: Record<string, number> = {}

  transactions
    .filter((t) => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
    .forEach((t) => {
      result[t.categoryId] = (result[t.categoryId] ?? 0) + t.amount
    })

  return result
}

export function getSpendingTrend(
  transactions: Transaction[],
  months: number = 6
): { month: string; label: string; amount: number }[] {
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const month = format(date, 'yyyy-MM')
    result.push({
      month,
      label: format(date, 'MMM'),
      amount: getMonthlyExpenses(transactions, month),
    })
  }
  return result
}
