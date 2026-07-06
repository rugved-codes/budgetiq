import type { Budget, Goal, Transaction } from '../types'
import { getCategory } from './categories'
import { formatCurrency } from './utils'

export interface AssistantContext {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  currentMonth: string
  balance: number
  safeToSpend: number
  monthlyIncome: number
  monthlyExpenses: number
  topCategory: { id: string; name: string; amount: number } | null
  budgetAlert: { name: string; percent: number; spent: number; limit: number } | null
  goalProgress: { name: string; progress: number; remaining: number } | null
  insights: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export function generateAssistantReply(question: string, context: AssistantContext): string {
  const query = question.toLowerCase()

  if (query.includes('balance') || query.includes('net')) {
    return `Your current balance is ${formatCurrency(context.balance)}. That includes all income and expenses logged so far, and it is a good snapshot of your overall cash position.`
  }

  if (query.includes('income')) {
    return `Your income this month is ${formatCurrency(context.monthlyIncome)} against ${formatCurrency(context.monthlyExpenses)} in expenses. That leaves you with a solid starting point for planning your next spending decisions.`
  }

  if (query.includes('expense') || query.includes('spending') || query.includes('where')) {
    if (context.topCategory) {
      return `Your biggest spending category this month is ${context.topCategory.name} at ${formatCurrency(context.topCategory.amount)}. If you want to trim costs, that is the best place to start.`
    }
    return `You have not logged enough expense data yet to spot a clear spending pattern. Add a few transactions and I can help you identify the trend.`
  }

  if (query.includes('budget') || query.includes('limit')) {
    if (context.budgetAlert) {
      return `${context.budgetAlert.name} is ${Math.round(context.budgetAlert.percent)}% utilized, with ${formatCurrency(context.budgetAlert.spent)} spent of your ${formatCurrency(context.budgetAlert.limit)} limit. You are getting close to your cap, so it may be smart to pace spending in this category.`
    }
    return `You have no category close to exceeding its budget right now. Keep an eye on your spending and I can flag any category that starts to drift.`
  }

  if (query.includes('safe') || query.includes('spend today') || query.includes('today')) {
    return `Based on your current monthly budgets, you can safely spend about ${formatCurrency(context.safeToSpend)} today. That number is calculated from remaining budget room and the days left in the month.`
  }

  if (query.includes('goal') || query.includes('save')) {
    if (context.goalProgress) {
      return `${context.goalProgress.name} is ${Math.round(context.goalProgress.progress)}% complete, with ${formatCurrency(context.goalProgress.remaining)} left to reach your target. You are on a good path, but a small extra contribution would speed things up.`
    }
    return `You do not have any active savings goals yet. Creating one can help you track progress and keep your spending aligned with longer-term priorities.`
  }

  if (query.includes('advice') || query.includes('help') || query.includes('recommend')) {
    const insight = context.insights[0]
    if (insight) {
      return `A practical next step is to focus on ${insight.toLowerCase()}. I can help you turn that into an action plan if you want.`
    }
    return 'A balanced next step is to review your biggest expense category and compare it with your monthly budget so you can spot opportunities to save.'
  }

  const summary = [
    `You currently have ${formatCurrency(context.balance)} in balance,`,
    `${formatCurrency(context.monthlyExpenses)} in monthly expenses,`,
    `and ${formatCurrency(context.safeToSpend)} available to spend safely today.`,
  ].join(' ')

  return `Here is a quick snapshot: ${summary} Ask me about your budget, spending, goals, or safe-to-spend limits and I will tailor the answer to your data.`
}

export function getAssistantContext(params: {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  currentMonth: string
  balance: number
  safeToSpend: number
  monthlyIncome: number
  monthlyExpenses: number
  insights: string[]
}): AssistantContext {
  const { transactions, budgets, goals, currentMonth, balance, safeToSpend, monthlyIncome, monthlyExpenses, insights } = params

  const spendingByCategory = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<Record<string, number>>((acc, tx) => {
      const month = tx.date.slice(0, 7)
      if (month === currentMonth) {
        acc[tx.categoryId] = (acc[tx.categoryId] ?? 0) + tx.amount
      }
      return acc
    }, {})

  const topCategoryEntry = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCategoryEntry
    ? { id: topCategoryEntry[0], name: getCategory(topCategoryEntry[0]).name, amount: topCategoryEntry[1] }
    : null

  const budgetAlert = budgets
    .filter((budget) => budget.month === currentMonth)
    .map((budget) => {
      const spent = transactions
        .filter((tx) => tx.type === 'expense' && tx.categoryId === budget.categoryId && tx.date.startsWith(currentMonth))
        .reduce((sum, tx) => sum + tx.amount, 0)
      const percent = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0
      return { id: budget.id, name: getCategory(budget.categoryId).name, percent, spent, limit: budget.limit }
    })
    .sort((a, b) => b.percent - a.percent)[0] ?? null

  const goalProgress = goals
    .map((goal) => ({
      name: goal.name,
      progress: goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0,
      remaining: Math.max(goal.targetAmount - goal.currentAmount, 0),
    }))
    .sort((a, b) => b.progress - a.progress)[0] ?? null

  return {
    transactions,
    budgets,
    goals,
    currentMonth,
    balance,
    safeToSpend,
    monthlyIncome,
    monthlyExpenses,
    topCategory,
    budgetAlert,
    goalProgress,
    insights,
  }
}
