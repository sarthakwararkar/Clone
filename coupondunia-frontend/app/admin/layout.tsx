export const dynamic = 'force-dynamic'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAdmin>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <AdminSidebar />
        </aside>

        {/* Admin Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
