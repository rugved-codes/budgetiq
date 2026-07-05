import {
  Sparkles, ArrowLeftRight, PiggyBank, BarChart3, Target, Rocket,
  ChevronRight, ChevronLeft,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface OnboardingModalProps {
  onComplete: () => void
  onSkip: () => void
}

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to BudgetIQ',
    description:
      'Your personal finance companion. Track spending, set budgets, and reach savings goals — all in one clean app.',
    tip: 'No account needed. Everything stays on your device.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Track transactions',
    description:
      'Log income and expenses in seconds. Use the + button anywhere to add a transaction quickly.',
    tip: 'Descriptions like "Starbucks" or "Uber" are auto-categorized for you.',
  },
  {
    icon: PiggyBank,
    title: 'Set monthly budgets',
    description:
      'Assign spending limits to categories like Food, Transport, and Bills. Progress bars show how much you\'ve used.',
    tip: 'Get alerts when you\'re approaching or over a budget limit.',
  },
  {
    icon: BarChart3,
    title: 'Understand your spending',
    description:
      'Analytics shows pie charts, trends over time, and smart insights like "You spent 20% more on food this month."',
    tip: 'Check Analytics after a week of tracking for meaningful patterns.',
  },
  {
    icon: Target,
    title: 'Reach savings goals',
    description:
      'Create goals with a target amount and deadline. Add contributions anytime and watch your progress grow.',
    tip: 'Start with one goal — an emergency fund is a great first choice.',
  },
  {
    icon: Rocket,
    title: 'You\'re ready to go',
    description:
      'Your wallet starts at zero. Add your first income or expense to begin building your financial picture.',
    tip: 'Most people start by logging their monthly income, then recent expenses.',
  },
]

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-primary)]">
        <div className="absolute inset-0 gradient-brand opacity-[0.07] dark:opacity-[0.12]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-teal/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="card-elevated overflow-hidden">
          <div className="p-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon size={28} className="text-white" />
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              {current.description}
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 rounded-lg px-3 py-2 inline-block">
              {current.tip}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                  i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-[var(--border-color)] hover:bg-brand-300'
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-2 border-t border-[var(--border-color)]">
            <button
              onClick={onSkip}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer px-2 py-1"
            >
              Skip intro
            </button>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft size={16} /> Back
                </Button>
              )}
              {isLast ? (
                <Button size="sm" onClick={onComplete}>
                  Get started <Rocket size={16} />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                  Next <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
