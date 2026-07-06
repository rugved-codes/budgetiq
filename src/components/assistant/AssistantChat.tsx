import { useMemo, useRef, useState } from 'react'
import { SendHorizonal, Sparkles, Bot } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useApp } from '../../context/AppContext'
import { generateAssistantReply, getAssistantContext, type ChatMessage } from '../../lib/assistant'
import { formatCurrency, getMonthlyExpenses, getMonthlyIncome } from '../../lib/utils'

const starterPrompts = [
  '💰 How much can I safely spend today?',
  '📊 What\'s my biggest expense category?',
  '🎯 How are my savings goals tracking?',
  '💡 What financial advice do you have?',
]

export function AssistantChat() {
  const { transactions, budgets, goals, currentMonth, balance, safeToSpend, insights } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hey! 👋 I\'m your AI finance assistant. I can help you understand your spending, optimize your budget, reach your goals, and answer any questions you have. Ask me anything about your finances or any topic!',
      createdAt: new Date().toISOString(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const monthlyIncome = useMemo(() => getMonthlyIncome(transactions, currentMonth), [transactions, currentMonth])
  const monthlyExpenses = useMemo(() => getMonthlyExpenses(transactions, currentMonth), [transactions, currentMonth])

  const assistantContext = useMemo(
    () =>
      getAssistantContext({
        transactions,
        budgets,
        goals,
        currentMonth,
        balance,
        safeToSpend,
        monthlyIncome,
        monthlyExpenses,
        insights: insights.map((item) => item.message),
      }),
    [transactions, budgets, goals, currentMonth, balance, safeToSpend, monthlyIncome, monthlyExpenses, insights]
  )

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || busy) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setDraft('')
    setBusy(true)

    try {
      const reply = await generateAssistantReply(trimmed, assistantContext, messages)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Card className="animate-slide-up stagger-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Finance Assistant</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Balance {formatCurrency(balance)} • Safe to spend {formatCurrency(safeToSpend)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 space-y-3 max-h-[430px] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm ${message.role === 'user' ? 'bg-brand-600 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {message.role === 'assistant' ? <Bot size={14} /> : null}
                <span className="text-[11px] uppercase tracking-wide opacity-70">{message.role === 'assistant' ? 'assistant' : 'you'}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setDraft(prompt)}
            className="rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask about your spending, goals, or budget..."
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={busy || !draft.trim()} className="shrink-0">
          <SendHorizonal size={16} />
        </Button>
      </div>
    </Card>
  )
}
