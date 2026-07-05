import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Transaction, Budget, Goal, Insight } from '../types'
import { loadData, saveData } from '../lib/storage'
import { generateId, getCurrentMonth, calculateBalance, getSafeToSpendToday } from '../lib/utils'
import { generateInsights, suggestBudgetLimit } from '../lib/smart'

interface AppContextValue {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  currentMonth: string
  balance: number
  safeToSpend: number
  insights: Insight[]
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setBudget: (categoryId: string, limit: number, month?: string) => void
  deleteBudget: (id: string) => void
  suggestBudget: (categoryId: string) => number
  addGoal: (data: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void
  updateGoal: (id: string, data: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void
  transactionModalOpen: boolean
  openTransactionModal: () => void
  closeTransactionModal: () => void
  editingTransaction: Transaction | null
  openEditTransaction: (transaction: Transaction) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => loadData())
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const currentMonth = getCurrentMonth()

  useEffect(() => {
    saveData(data)
  }, [data])

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() }
    setData((prev) => ({ ...prev, transactions: [newTx, ...prev.transactions] }))
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const setBudget = useCallback((categoryId: string, limit: number, month?: string) => {
    const m = month ?? currentMonth
    setData((prev) => {
      const existing = prev.budgets.find((b) => b.categoryId === categoryId && b.month === m)
      if (existing) {
        return {
          ...prev,
          budgets: prev.budgets.map((b) =>
            b.id === existing.id ? { ...b, limit } : b
          ),
        }
      }
      return {
        ...prev,
        budgets: [...prev.budgets, { id: generateId(), categoryId, limit, month: m }],
      }
    })
  }, [currentMonth])

  const deleteBudget = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }))
  }, [])

  const suggestBudget = useCallback(
    (categoryId: string) => suggestBudgetLimit(categoryId, data.transactions),
    [data.transactions]
  )

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    }
    setData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }))
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }))
  }, [])

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      ),
    }))
  }, [])

  const balance = useMemo(() => calculateBalance(data.transactions), [data.transactions])
  const safeToSpend = useMemo(
    () => getSafeToSpendToday(data.transactions, data.budgets, currentMonth),
    [data.transactions, data.budgets, currentMonth]
  )
  const insights = useMemo(
    () => generateInsights(data.transactions, currentMonth),
    [data.transactions, currentMonth]
  )

  const openTransactionModal = useCallback(() => {
    setEditingTransaction(null)
    setTransactionModalOpen(true)
  }, [])

  const closeTransactionModal = useCallback(() => {
    setTransactionModalOpen(false)
    setEditingTransaction(null)
  }, [])

  const openEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionModalOpen(true)
  }, [])

  return (
    <AppContext.Provider
      value={{
        transactions: data.transactions,
        budgets: data.budgets,
        goals: data.goals,
        currentMonth,
        balance,
        safeToSpend,
        insights,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        suggestBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        transactionModalOpen,
        openTransactionModal,
        closeTransactionModal,
        editingTransaction,
        openEditTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
