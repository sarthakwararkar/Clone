'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/categories', icon: Grid3X3, label: 'Categories' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href as any}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isActive && 'text-primary'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
