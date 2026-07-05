import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Modal } from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/categories'
import { autoCategorize } from '../../lib/smart'
import type { TransactionType } from '../../types'

export function TransactionModal() {
  const {
    transactionModalOpen,
    closeTransactionModal,
    editingTransaction,
    addTransaction,
    updateTransaction,
  } = useApp()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [autoDetected, setAutoDetected] = useState(false)

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      setAmount(String(editingTransaction.amount))
      setCategoryId(editingTransaction.categoryId)
      setDescription(editingTransaction.description)
      setDate(editingTransaction.date)
      setAutoDetected(false)
    } else {
      setType('expense')
      setAmount('')
      setCategoryId('food')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setAutoDetected(false)
    }
  }, [editingTransaction, transactionModalOpen])

  useEffect(() => {
    if (!editingTransaction && description.length > 2) {
      const detected = autoCategorize(description)
      if (detected !== 'other') {
        setCategoryId(detected)
        setAutoDetected(true)
      } else {
        setAutoDetected(false)
      }
    }
  }, [description, editingTransaction])

  const categories = type === 'income' ? CATEGORIES.filter((c) => c.id === 'income') : EXPENSE_CATEGORIES

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) return

    const data = {
      type,
      amount: parsedAmount,
      categoryId: type === 'income' ? 'income' : categoryId,
      description: description.trim() || (type === 'income' ? 'Income' : 'Expense'),
      date,
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data)
    } else {
      addTransaction(data)
    }
    closeTransactionModal()
  }

  return (
    <Modal
      open={transactionModalOpen}
      onClose={closeTransactionModal}
      title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-tertiary)]">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t)
                if (t === 'income') setCategoryId('income')
                else setCategoryId('food')
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-red-500 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'income' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Description"
          placeholder="e.g. Starbucks coffee"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {autoDetected && (
          <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-2 rounded-lg">
            <Sparkles size={14} />
            Auto-categorized based on description
          </div>
        )}

        {type === 'expense' && (
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setAutoDetected(false)
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        )}

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={closeTransactionModal}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {editingTransaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
