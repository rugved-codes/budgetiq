import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Target,
  Moon, Sun, Plus, Sparkles,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/goals', icon: Target, label: 'Goals' },
]

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { openTransactionModal } = useApp()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] h-dvh sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[var(--text-primary)]">BudgetIQ</h1>
          <p className="text-xs text-[var(--text-muted)]">Smart finance tracker</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-3 border-t border-[var(--border-color)]">
        <button
          onClick={openTransactionModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-md hover:shadow-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus size={16} />
          Add Transaction
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const { openTransactionModal } = useApp()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-muted)]'
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={openTransactionModal}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full gradient-brand text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all cursor-pointer"
        aria-label="Add transaction"
      >
        <Plus size={22} />
      </button>
    </nav>
  )
}

export function MobileHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-bold text-[var(--text-primary)]">BudgetIQ</span>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
