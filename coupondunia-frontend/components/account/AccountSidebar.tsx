'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bookmark, Bell, LogOut } from 'lucide-react'
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

  return (
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
          onClick={() => void signOut()}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-l-2 border-transparent w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
