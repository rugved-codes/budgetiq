export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
  createdAt: string
}

export interface Budget {
  id: string
  categoryId: string
  limit: number
  month: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  createdAt: string
}

export interface AppData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}

export interface Insight {
  id: string
  type: 'warning' | 'info' | 'success'
  message: string
}
