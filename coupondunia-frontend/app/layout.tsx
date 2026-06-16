import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { WebsiteSchema } from '@/components/seo/WebsiteSchema'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dealdhamal.vercel.app'),
  title: {
    default: 'DealDhamal — Best Coupons, Promo Codes & Deals in India',
    template: '%s | DealDhamal',
  },
  description: 'Find the best coupon codes, promo codes, and cashback deals from top Indian brands like Flipkart, Amazon, Myntra, Swiggy, Zomato and 500+ more stores.',
  keywords: ['coupons india', 'promo codes', 'discount codes', 'cashback offers', 'deals india', 'dealdhamal', 'flipkart coupons', 'amazon coupons', 'myntra coupons'],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'verify-admitad': 'b4f42b1e01',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dealdhamal.vercel.app',
    siteName: 'DealDhamal',
    title: 'DealDhamal — Best Coupons & Deals in India',
    description: 'Find the best coupon codes, promo codes, and cashback deals from 500+ Indian stores.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DealDhamal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealDhamal — Best Coupons & Deals in India',
    description: 'Find the best coupon codes and cashback deals from 500+ Indian stores.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://dealdhamal.vercel.app',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-93D34R6XN1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-93D34R6XN1');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <Providers>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 mb-16 md:mb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <Toaster position="top-right" richColors />
        </Providers>
        <OrganizationSchema />
        <WebsiteSchema />
      </body>
    </html>
  )
}
