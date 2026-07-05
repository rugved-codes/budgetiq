import { useState } from 'react'
import { Plus, Target, Trash2, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { formatCurrency, getGoalProgress, formatDate } from '../lib/utils'
import { differenceInDays, parseISO } from 'date-fns'

export function GoalsPage() {
  const { goals, addGoal, deleteGoal, contributeToGoal } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [showContribute, setShowContribute] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount)
    if (!name.trim() || !target || target <= 0 || !deadline) return
    addGoal({ name: name.trim(), targetAmount: target, deadline })
    setName('')
    setTargetAmount('')
    setDeadline('')
    setShowCreate(false)
  }

  const handleContribute = () => {
    if (!showContribute) return
    const amount = parseFloat(contributionAmount)
    if (!amount || amount <= 0) return
    contributeToGoal(showContribute, amount)
    setContributionAmount('')
    setShowContribute(null)
  }

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Savings Goals</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your progress toward financial goals</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="gradient-brand text-white border-0" elevated>
          <p className="text-sm text-white/80 font-medium">Total Saved</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalSaved)}</p>
          <p className="text-sm text-white/70 mt-1">of {formatCurrency(totalTarget)} target</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Active Goals</p>
          <p className="text-3xl font-bold tabular-nums mt-1 text-[var(--text-primary)]">{goals.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {goals.filter((g) => getGoalProgress(g) >= 100).length} completed
          </p>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-16">
          <Target size={40} className="mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)] mb-4">No savings goals yet. Start building your future!</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create your first goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal)
            const daysLeft = differenceInDays(parseISO(goal.deadline), new Date())
            const remaining = goal.targetAmount - goal.currentAmount

            return (
              <Card key={goal.id} elevated>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-teal/15 flex items-center justify-center">
                      <Target size={20} className="text-accent-teal" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Due {formatDate(goal.deadline)}
                        {daysLeft > 0 && ` · ${daysLeft} days left`}
                        {daysLeft <= 0 && ' · Past due'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this goal?')) deleteGoal(goal.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] tabular-nums">
                      of {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color="#14b8a6" showLabel />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-muted)]">
                    {progress >= 100
                      ? 'Goal reached!'
                      : `${formatCurrency(remaining)} to go · ${Math.round(progress)}%`}
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => setShowContribute(goal.id)}>
                    <DollarSign size={14} /> Contribute
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Savings Goal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g. Emergency Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Target Amount"
            type="number"
            step="1"
            min="1"
            placeholder="1000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Create Goal</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!showContribute}
        onClose={() => setShowContribute(null)}
        title="Add Contribution"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowContribute(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleContribute}>
              Add Contribution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
