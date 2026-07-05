import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { getCategory } from '../lib/categories'
import {
  formatCurrency, getMonthlySpendingByCategory, getSpendingTrend,
  getMonthlyExpenses, getMonthLabel,
} from '../lib/utils'
import { subMonths, format } from 'date-fns'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#3b82f6', '#ef4444', '#22c55e']

export function AnalyticsPage() {
  const { transactions, currentMonth, insights } = useApp()

  const categoryData = useMemo(() => {
    const spending = getMonthlySpendingByCategory(transactions, currentMonth)
    return Object.entries(spending)
      .map(([id, amount]) => ({
        name: getCategory(id).name,
        value: amount,
        color: getCategory(id).color,
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, currentMonth])

  const trendData = useMemo(() => getSpendingTrend(transactions, 6), [transactions])

  const comparisonData = useMemo(() => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const month = format(date, 'yyyy-MM')
      months.push({
        name: format(date, 'MMM'),
        expenses: getMonthlyExpenses(transactions, month),
        income: transactions
          .filter((t) => t.type === 'income' && t.date.startsWith(month))
          .reduce((s, t) => s + t.amount, 0),
      })
    }
    return months
  }, [transactions])

  const totalSpending = categoryData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{getMonthLabel(currentMonth)} insights</p>
      </div>

      {insights.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Monthly Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)]"
              >
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
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Spending by Category</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">Total: {formatCurrency(totalSpending)}</p>
          {categoryData.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-12">No expense data this month</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categoryData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[var(--text-secondary)] truncate">{d.name}</span>
                    <span className="ml-auto font-medium text-[var(--text-primary)] tabular-nums">
                      {formatCurrency(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Spending Over Time</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Monthly Comparison</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Income vs expenses (last 3 months)</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={comparisonData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#6366f1" radius={[6, 6, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
