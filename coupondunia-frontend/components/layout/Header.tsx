'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, User, LogOut, ShieldCheck, Bookmark, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/search/SearchBar'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CD</span>
          </div>
          <span className="font-bold text-xl text-primary hidden sm:block">CouponDunia</span>
        </Link>

        {/* Desktop search */}
        <div className="flex-1 hidden md:flex justify-center max-w-lg mx-auto">
          <SearchBar />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 ml-auto">
          <Link
            href="/stores"
            className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Stores
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Categories
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[120px] truncate">
                  {user.name ?? user.email}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        href="/account/saved"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Bookmark className="w-4 h-4" /> Saved Coupons
                      </Link>
                      <Link
                        href="/account/alerts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Bell className="w-4 h-4" /> Deal Alerts
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary-light"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { void signOut(); setUserMenuOpen(false) }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile: search icon + hamburger */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <Link href="/search">
            <button className="p-2 text-gray-600 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </Link>
          <button
            className="p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link
            href="/stores"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            Stores
          </Link>
          <Link
            href="/categories"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            Categories
          </Link>
          {user ? (
            <>
              <Link href="/account" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <Link href="/account/saved" className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Saved</Link>
              <button
                onClick={() => { void signOut(); setMobileMenuOpen(false) }}
                className="block w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full">Login</Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
