const ONBOARDING_KEY = 'budgetiq-onboarding-complete'

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY)
}
