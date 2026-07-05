import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import { OnboardingProvider } from './context/OnboardingContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { BudgetPage } from './pages/BudgetPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { GoalsPage } from './pages/GoalsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </AppProvider>
    </ThemeProvider>
  )
}
