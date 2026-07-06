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

export async function generateAssistantReply(
  question: string,
  context: AssistantContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        context: {
          balance: context.balance,
          monthlyIncome: context.monthlyIncome,
          monthlyExpenses: context.monthlyExpenses,
          safeToSpend: context.safeToSpend,
          budgets: context.budgets,
          goals: context.goals,
          insights: context.insights,
        },
        conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Chat API error:', error);
      return getFallbackReply(question, context);
    }

    const data = await response.json();
    return data.reply || getFallbackReply(question, context);
  } catch (error) {
    console.error('Failed to get AI response:', error);
    return getFallbackReply(question, context);
  }
}

function getFallbackReply(question: string, context: AssistantContext): string {
  const query = question.toLowerCase()

  // Finance-specific responses
  if (query.includes('balance') || query.includes('how much do i have')) {
    return `Your current balance is ${formatCurrency(context.balance)}. This represents your total cash position across all accounts. You also have ${formatCurrency(context.safeToSpend)} available to spend safely today based on your budgets and remaining days this month.`
  }

  if (query.includes('income') || query.includes('how much do i make')) {
    const ratio = context.monthlyExpenses > 0 ? ((context.monthlyIncome - context.monthlyExpenses) / context.monthlyIncome * 100).toFixed(1) : 0
    return `You're earning ${formatCurrency(context.monthlyIncome)} this month against ${formatCurrency(context.monthlyExpenses)} in expenses. That's a ${ratio}% savings rate—keep it up! 💪`
  }

  if (query.includes('expense') || query.includes('spending') || query.includes('where') || query.includes('most spending')) {
    if (context.topCategory) {
      return `Your top spending category is **${context.topCategory.name}** at ${formatCurrency(context.topCategory.amount)} this month. This is where you have the most room to optimize if you want to increase savings. Consider tracking transactions in this category more closely.`
    }
    return `You haven't logged enough transactions yet to identify spending patterns. Once you add more data, I can give you detailed insights into where your money goes.`
  }

  if (query.includes('budget') || query.includes('limit') || query.includes('budgeting')) {
    if (context.budgetAlert) {
      return `**${context.budgetAlert.name}** is at ${Math.round(context.budgetAlert.percent)}% of your limit (${formatCurrency(context.budgetAlert.spent)} of ${formatCurrency(context.budgetAlert.limit)}). You're getting close—consider pulling back on spending in this category for the rest of the month.`
    }
    return `Great news! All your budgets are on track. You're spending within your limits across all categories. This is excellent budget discipline! 📊`
  }

  if (query.includes('safe') || query.includes('spend today') || query.includes('can i spend') || query.includes('how much can i spend')) {
    return `You can safely spend about ${formatCurrency(context.safeToSpend)} today without exceeding your monthly budgets. This accounts for your remaining budget room and the days left in the month. Spend wisely! 💰`
  }

  if (query.includes('goal') || query.includes('save') || query.includes('savings')) {
    if (context.goalProgress) {
      const percentLeft = 100 - context.goalProgress.progress
      return `Your goal **${context.goalProgress.name}** is ${context.goalProgress.progress.toFixed(0)}% complete! You need ${formatCurrency(context.goalProgress.remaining)} more to reach your target. At your current pace, you're making great progress. Keep going! 🎯`
    }
    return `You don't have any active savings goals yet. Setting a goal can help you stay motivated and track progress toward important financial milestones. Would you like to create one?`
  }

  if (query.includes('advice') || query.includes('help') || query.includes('recommend') || query.includes('suggest')) {
    const insights = context.insights
    if (insights.length > 0) {
      return `Here's my top recommendation: ${insights[0]}. Focus on this area and you'll see meaningful improvements in your financial health.`
    }
    return `Based on your data, I'd suggest: 1) Review your top spending category and see if there are opportunities to cut back, 2) Set a specific savings goal, 3) Track your daily spending to stay aware. Want to discuss any of these?`
  }

  // General knowledge fallback
  if (query.length > 3) {
    return `I'm here to help with your finances! I can answer questions about your balance, spending, budgets, savings goals, and general financial advice. I can also help with general knowledge questions. What would you like to know?`
  }

  const summary = [
    `📊 Balance: ${formatCurrency(context.balance)}`,
    `💸 Monthly expenses: ${formatCurrency(context.monthlyExpenses)}`,
    `💰 Safe to spend today: ${formatCurrency(context.safeToSpend)}`,
  ].join('\n')

  return `Here's your quick financial snapshot:\n\n${summary}\n\nFeel free to ask me about your budget, spending patterns, goals, or any financial questions!`
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
