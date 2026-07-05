const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['grocery', 'groceries', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'starbucks', 'mcdonalds', 'uber eats', 'doordash', 'grubhub', 'pizza', 'sushi', 'bakery', 'deli', 'market', 'whole foods', 'trader joe'],
  transport: ['uber', 'lyft', 'gas', 'fuel', 'parking', 'transit', 'metro', 'bus', 'train', 'taxi', 'car', 'auto', 'toll', 'shell', 'chevron', 'exxon'],
  shopping: ['amazon', 'target', 'walmart', 'costco', 'shop', 'store', 'mall', 'clothing', 'shoes', 'electronics', 'best buy', 'ikea', 'nike', 'adidas'],
  entertainment: ['netflix', 'spotify', 'hulu', 'disney', 'movie', 'cinema', 'concert', 'game', 'steam', 'playstation', 'xbox', 'ticket', 'theater', 'bar', 'club'],
  bills: ['rent', 'mortgage', 'electric', 'water', 'internet', 'phone', 'insurance', 'utility', 'subscription', 'bill', 'payment', 'comcast', 'verizon', 'at&t'],
  health: ['pharmacy', 'doctor', 'hospital', 'dental', 'gym', 'fitness', 'medical', 'health', 'cvs', 'walgreens', 'medicine', 'therapy'],
  education: ['tuition', 'school', 'university', 'college', 'course', 'book', 'textbook', 'udemy', 'coursera', 'education', 'student'],
}

export function autoCategorize(description: string): string {
  const lower = description.toLowerCase()
  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return categoryId
    }
  }
  return 'other'
}

export function suggestBudgetLimit(
  categoryId: string,
  transactions: { type: string; categoryId: string; amount: number; date: string }[],
  months: number = 3
): number {
  const now = new Date()
  const monthlyTotals: number[] = []

  for (let i = 1; i <= months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const total = transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.categoryId !== categoryId) return false
        const d = new Date(t.date)
        return d >= monthStart && d <= monthEnd
      })
      .reduce((sum, t) => sum + t.amount, 0)

    if (total > 0) monthlyTotals.push(total)
  }

  if (monthlyTotals.length === 0) return 0
  const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
  return Math.ceil(avg * 1.1)
}

export function generateInsights(
  transactions: { type: string; categoryId: string; amount: number; date: string }[],
  currentMonth: string
): { id: string; type: 'warning' | 'info' | 'success'; message: string }[] {
  const insights: { id: string; type: 'warning' | 'info' | 'success'; message: string }[] = []

  const now = new Date()
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const currentByCategory: Record<string, number> = {}
  const prevByCategory: Record<string, number> = {}

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const month = t.date.slice(0, 7)
      if (month === currentMonth) {
        currentByCategory[t.categoryId] = (currentByCategory[t.categoryId] ?? 0) + t.amount
      } else if (month === prevMonth) {
        prevByCategory[t.categoryId] = (prevByCategory[t.categoryId] ?? 0) + t.amount
      }
    })

  const categoryNames: Record<string, string> = {
    food: 'food', transport: 'transport', shopping: 'shopping',
    entertainment: 'entertainment', bills: 'bills', health: 'health',
    education: 'education', other: 'other',
  }

  for (const [catId, current] of Object.entries(currentByCategory)) {
    const prev = prevByCategory[catId] ?? 0
    if (prev > 0) {
      const change = ((current - prev) / prev) * 100
      if (Math.abs(change) >= 15) {
        const name = categoryNames[catId] ?? catId
        if (change > 0) {
          insights.push({
            id: `spend-up-${catId}`,
            type: 'warning',
            message: `You spent ${Math.round(change)}% more on ${name} this month`,
          })
        } else {
          insights.push({
            id: `spend-down-${catId}`,
            type: 'success',
            message: `You spent ${Math.round(Math.abs(change))}% less on ${name} this month`,
          })
        }
      }
    }
  }

  const highest = Object.entries(currentByCategory).sort((a, b) => b[1] - a[1])[0]
  if (highest) {
    const name = categoryNames[highest[0]] ?? highest[0]
    insights.push({
      id: 'highest-category',
      type: 'info',
      message: `Your highest spending category is ${name} (${Math.round(highest[1])} total)`,
    })
  }

  const currentExpenses = Object.values(currentByCategory).reduce((a, b) => a + b, 0)
  const prevExpenses = Object.values(prevByCategory).reduce((a, b) => a + b, 0)
  if (prevExpenses > 0 && currentExpenses < prevExpenses * 0.9) {
    insights.push({
      id: 'overall-saving',
      type: 'success',
      message: 'Great job! Your overall spending is down compared to last month',
    })
  }

  return insights.slice(0, 4)
}
