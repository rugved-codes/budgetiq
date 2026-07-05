import { Outlet } from 'react-router-dom'
import { Sidebar, BottomNav, MobileHeader } from './Navigation'
import { TransactionModal } from '../transactions/TransactionModal'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <TransactionModal />
    </div>
  )
}
