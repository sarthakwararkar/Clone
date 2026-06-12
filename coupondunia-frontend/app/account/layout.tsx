'use client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Account Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <AccountSidebar />
        </aside>
        
        {/* Main Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
