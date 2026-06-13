import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s | DealDhamal',
    default: 'Best Coupons, Promo Codes & Cashback Offers | DealDhamal',
  },
  description: 'Find verified coupon codes, cashback offers, and top store discounts. Shop and save more today with DealDhamal.',
  openGraph: {
    title: 'Best Coupons & Deals in India | DealDhamal',
    description: 'Find verified coupon codes, cashback offers, and top store discounts. Shop and save more today with DealDhamal.',
    url: 'http://localhost:3000',
    siteName: 'DealDhamal',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Coupons & Deals in India | DealDhamal',
    description: 'Find verified coupon codes, cashback offers, and top store discounts. Shop and save more today with DealDhamal.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <Providers>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 mb-16 md:mb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <Toaster position="top-right" richColors />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
