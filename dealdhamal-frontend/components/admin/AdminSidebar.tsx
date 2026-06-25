'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tag, Store, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, exact: false },
  { href: '/admin/stores', label: 'Stores', icon: Store, exact: false },
  { href: '/admin/commenters', label: 'Commentators', icon: YoutubeIcon, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 hidden md:block">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
        </div>
        <nav className="py-2">
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
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Site
          </Link>
        </div>
      </div>
    </aside>
  )
}
