import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', color: '#f97316' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#8b5cf6' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#ef4444' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#14b8a6' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366f1' },
  { id: 'income', name: 'Income', icon: 'Wallet', color: '#22c55e' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
]

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'income')

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
