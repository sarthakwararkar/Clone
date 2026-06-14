'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShieldCheck, 
  Bookmark, 
  Bell, 
  ChevronDown,
  Shirt, 
  Laptop, 
  Utensils, 
  Sparkles, 
  Plane, 
  ShoppingBasket, 
  HeartPulse, 
  Home as HomeIcon
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from '@/components/search/SearchBar'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import type { Category, Store, Coupon } from '@/types'


// Category styling config: maps slugs to specific icons and soft brand colors
const CATEGORY_STYLE: Record<string, { icon: React.ComponentType<any>; bg: string; text: string }> = {
  fashion: { icon: Shirt, bg: 'bg-rose-50 group-hover:bg-rose-500', text: 'text-rose-500 group-hover:text-white' },
  electronics: { icon: Laptop, bg: 'bg-blue-50 group-hover:bg-blue-500', text: 'text-blue-500 group-hover:text-white' },
  food: { icon: Utensils, bg: 'bg-orange-50 group-hover:bg-orange-500', text: 'text-orange-500 group-hover:text-white' },
  beauty: { icon: Sparkles, bg: 'bg-purple-50 group-hover:bg-purple-500', text: 'text-purple-500 group-hover:text-white' },
  travel: { icon: Plane, bg: 'bg-teal-50 group-hover:bg-teal-500', text: 'text-teal-500 group-hover:text-white' },
  grocery: { icon: ShoppingBasket, bg: 'bg-green-50 group-hover:bg-green-500', text: 'text-green-500 group-hover:text-white' },
  health: { icon: HeartPulse, bg: 'bg-red-50 group-hover:bg-red-500', text: 'text-red-500 group-hover:text-white' },
  'home-living': { icon: HomeIcon, bg: 'bg-indigo-50 group-hover:bg-indigo-500', text: 'text-indigo-500 group-hover:text-white' },
}

const getCategoryStyle = (slug: string) => {
  return CATEGORY_STYLE[slug] || { icon: Sparkles, bg: 'bg-gray-50 group-hover:bg-gray-500', text: 'text-gray-500 group-hover:text-white' }
}

export function Header() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'categories' | 'stores' | 'offers' | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [bestCoupons, setBestCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {})
    api.getStores({ limit: 12 }).then(res => setStores(res.data)).catch(() => {})
    api.getCoupons({ featured: true, limit: 3 }).then(res => setBestCoupons(res.data)).catch(() => {})
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="DealDhamal Logo"
            width={32}
            height={32}
            className="rounded-lg object-contain"
          />
          <span className="font-bold text-xl text-primary hidden sm:block">DealDhamal</span>
        </Link>

        {/* Desktop search */}
        <div className="flex-1 hidden md:flex justify-center max-w-lg mx-auto">
          <SearchBar />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 ml-auto">
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
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/account'); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/account/saved'); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                      >
                        <Bookmark className="w-4 h-4" /> Saved Coupons
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/account/alerts'); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                      >
                        <Bell className="w-4 h-4" /> Deal Alerts
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setUserMenuOpen(false); router.push('/admin'); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary-light w-full"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Panel
                        </button>
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
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300 px-3 py-1.5 text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md px-3 py-1.5 text-sm"
              >
                Sign Up
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

      {/* Sub-Header Category & Top Stores Navigation Bar */}
      <div className="bg-[#222222] text-white relative hidden md:block border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between">
          {/* Left Navigation Links */}
          <div className="flex items-center gap-1 h-full">
            {/* Categories Link with Dropdown Hover */}
            <div
              className="h-full relative"
              onMouseEnter={() => setActiveDropdown('categories')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/categories"
                className={`flex items-center gap-1 h-full px-4 text-sm font-semibold hover:bg-neutral-800 transition-colors border-b-2 ${
                  activeDropdown === 'categories' ? 'border-primary text-white bg-neutral-800' : 'border-transparent text-gray-300'
                }`}
              >
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
              </Link>

              {/* Categories Dropdown Panel */}
              {activeDropdown === 'categories' && (
                <div
                  className="absolute left-0 top-full mt-0 w-[340px] bg-white rounded-b-2xl shadow-2xl border border-gray-100 z-50 p-4 text-gray-800 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => setActiveDropdown('categories')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const style = getCategoryStyle(cat.slug)
                      const Icon = style.icon
                      return (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-150`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors truncate">
                            {cat.name}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <Link
                      href="/categories"
                      className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-0.5"
                      onClick={() => setActiveDropdown(null)}
                    >
                      All Categories &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Top Stores Link with Dropdown Hover */}
            <div
              className="h-full relative"
              onMouseEnter={() => setActiveDropdown('stores')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/stores"
                className={`flex items-center gap-1 h-full px-4 text-sm font-semibold hover:bg-neutral-800 transition-colors border-b-2 ${
                  activeDropdown === 'stores' ? 'border-primary text-white bg-neutral-800' : 'border-transparent text-gray-300'
                }`}
              >
                Top Stores
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'stores' ? 'rotate-180' : ''}`} />
              </Link>

              {/* Stores Dropdown Panel */}
              {activeDropdown === 'stores' && (
                <div
                  className="absolute left-0 top-full mt-0 w-[460px] bg-white rounded-b-2xl shadow-2xl border border-gray-100 z-50 p-4 text-gray-800 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => setActiveDropdown('stores')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {stores.slice(0, 10).map((store) => (
                      <Link
                        key={store.id}
                        href={`/stores/${store.slug}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100/50 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {store.logo_url ? (
                            <Image
                              src={store.logo_url}
                              alt={store.name}
                              width={36}
                              height={36}
                              className="object-contain w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <span className="text-gray-400 font-bold text-[10px]">
                              {store.name[0]}
                            </span>
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {store.name}
                          </h4>
                          {store.cashback_rate && (
                            <p className="text-[10px] text-green-600 font-semibold truncate flex items-center gap-0.5 mt-0.5">
                              <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
                              {store.cashback_rate}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <Link
                      href="/stores"
                      className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-0.5"
                      onClick={() => setActiveDropdown(null)}
                    >
                      All Stores &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Best Offers Link with Dropdown Hover */}
            <div
              className="h-full relative"
              onMouseEnter={() => setActiveDropdown('offers')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/best-offers"
                className={`flex items-center gap-1 h-full px-4 text-sm font-semibold hover:bg-neutral-800 transition-colors border-b-2 ${
                  activeDropdown === 'offers' ? 'border-primary text-white bg-neutral-800' : 'border-transparent text-gray-300'
                }`}
              >
                Best Offers
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'offers' ? 'rotate-180' : ''}`} />
              </Link>

              {/* Best Offers Dropdown Panel */}
              {activeDropdown === 'offers' && (
                <div
                  className="absolute left-0 top-full mt-0 w-[360px] bg-white rounded-b-2xl shadow-2xl border border-gray-100 z-50 p-4 text-gray-800 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => setActiveDropdown('offers')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="space-y-3">
                    {bestCoupons.map((coupon) => (
                      <Link
                        key={coupon.id}
                        href={`/coupons/${coupon.id}`}
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100/50 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          {coupon.store?.logo_url ? (
                            <Image
                              src={coupon.store.logo_url}
                              alt={coupon.store.name}
                              width={36}
                              height={36}
                              className="object-contain w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <span className="text-gray-400 font-bold text-[10px]">
                              {coupon.store?.name[0]}
                            </span>
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[10px] text-gray-400 font-bold truncate">
                            {coupon.store?.name}
                          </h5>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {coupon.title}
                          </h4>
                          <span className="inline-block text-[9px] bg-primary-light text-primary font-bold px-1.5 py-0.5 rounded-md mt-1">
                            {coupon.coupon_type.toUpperCase()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <Link
                      href="/best-offers"
                      className="text-[11px] font-bold text-primary hover:text-primary-dark flex items-center gap-0.5"
                      onClick={() => setActiveDropdown(null)}
                    >
                      All Best Offers &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Collections */}
            <Link
              href="/stores"
              className="flex items-center h-full px-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors border-b-2 border-transparent"
            >
              Collections
            </Link>

            {/* Share & Earn */}
            <Link
              href="/"
              className="flex items-center h-full px-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors border-b-2 border-transparent relative mr-6"
            >
              <span>Share &amp; Earn</span>
              <span className="absolute -top-1.5 -right-2.5 bg-yellow-400 text-neutral-900 text-[8px] font-black px-1 py-0.5 rounded leading-none uppercase tracking-wider scale-95 shadow-sm">
                New
              </span>
            </Link>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center h-full">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-100 bg-neutral-700 hover:bg-primary hover:text-white rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
              </svg>
              Add to Chrome - It's Free
            </a>
          </div>
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
              <Link
                href="/login"
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-primary border-2 border-primary hover:bg-primary-light focus:ring-primary px-3 py-1.5 text-sm w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md px-3 py-1.5 text-sm w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
