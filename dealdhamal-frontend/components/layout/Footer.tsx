import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="DealDhamal Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <span className="font-bold text-xl text-white">DealDhamal</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              India&apos;s best destination for coupons, promo codes, and cashback offers. Save more on every purchase.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">All Stores</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Search Deals</Link></li>
              <li><Link href={"/partner" as any} className="hover:text-white transition-colors">Partner with Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/account/saved" className="hover:text-white transition-colors">Saved Coupons</Link></li>
              <li><Link href="/account/alerts" className="hover:text-white transition-colors">Deal Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={"/categories/fashion" as any} className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href={"/categories/electronics" as any} className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href={"/categories/food" as any} className="hover:text-white transition-colors">Food & Dining</Link></li>
              <li><Link href={"/categories/travel" as any} className="hover:text-white transition-colors">Travel</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DealDhamal. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href={"/partner" as any} className="text-gray-500 hover:text-white transition-colors">Partner with Us</Link>
            <Link href={"/youtube-commenters" as any} className="text-gray-500 hover:text-white transition-colors">YouTube Commenters</Link>
            <Link href={"/privacy" as any} className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href={"/terms" as any} className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
