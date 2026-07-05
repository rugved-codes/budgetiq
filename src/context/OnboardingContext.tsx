import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { isOnboardingComplete, completeOnboarding } from '../lib/onboarding'
import { useApp } from './AppContext'
import { OnboardingModal } from '../components/onboarding/OnboardingModal'

interface OnboardingContextValue {
  showOnboardingAgain: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { openTransactionModal } = useApp()
  const [visible, setVisible] = useState(() => !isOnboardingComplete())

  const finish = useCallback(() => {
    completeOnboarding()
    setVisible(false)
  }, [])

  const finishAndStart = useCallback(() => {
    finish()
    openTransactionModal()
  }, [finish, openTransactionModal])

  const showOnboardingAgain = useCallback(() => {
    setVisible(true)
  }, [])

  return (
    <OnboardingContext.Provider value={{ showOnboardingAgain }}>
      {children}
      {visible && (
        <OnboardingModal onComplete={finishAndStart} onSkip={finish} />
      )}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
