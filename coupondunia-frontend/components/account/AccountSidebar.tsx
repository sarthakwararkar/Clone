'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bookmark, Bell, LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/account', label: 'Profile', icon: User, exact: true },
  { href: '/account/saved', label: 'Saved Coupons', icon: Bookmark, exact: false },
  { href: '/account/alerts', label: 'Deal Alerts', icon: Bell, exact: false },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <aside className="w-full md:w-56 flex-shrink-0">
        <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href as any}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2',
                  isActive
                    ? 'border-primary text-primary bg-primary-light'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-l-2 border-transparent w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Sign Out Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 p-6 relative animate-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            {/* Text */}
            <div className="text-center mb-5">
              <h3 className="text-base font-black text-gray-900">Sign out?</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                You'll need to sign in again to access your account, saved coupons, and cashback wallet.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); void signOut() }}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
