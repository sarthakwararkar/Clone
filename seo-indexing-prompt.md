# DealDhamal — SEO & Google Indexing Prompt for Antigravity

You are a senior Next.js engineer. I have a DealDhamal coupon site already built with Next.js 14 App Router deployed on Vercel. I need you to add complete Google indexing, SEO, and analytics infrastructure. Build every file below completely — no placeholders, no "implement later" comments.

---

## TASK 1 — SITEMAP (app/sitemap.ts)

Create app/sitemap.ts that generates a complete dynamic sitemap served at /sitemap.xml.

Fetch data directly with fetch() using NEXT_PUBLIC_API_URL env var. Handle errors gracefully — if any fetch fails, return only static pages without throwing.

```ts
import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.dealdhamal.in'
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/stores`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Fetch all stores — GET ${API_URL}/api/stores?limit=1000
  // Map each store to: url = ${BASE_URL}/stores/${store.slug}, priority 0.8, changeFrequency daily, lastModified store.updated_at
  // Wrap in try/catch — on error log and skip

  // Fetch all categories — GET ${API_URL}/api/categories
  // Map each to: url = ${BASE_URL}/categories/${category.slug}, priority 0.7, changeFrequency daily
  // Wrap in try/catch — on error log and skip

  // Return [...staticPages, ...storeUrls, ...categoryUrls]
}
```

Implement all fetch calls, error handling, and TypeScript types fully.

---

## TASK 2 — ROBOTS.TXT (app/robots.ts)

Create app/robots.ts:

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/search', '/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/account/', '/api/'],
      },
    ],
    sitemap: 'https://www.dealdhamal.in/sitemap.xml',
    host: 'https://www.dealdhamal.in',
  }
}
```

---

## TASK 3 — GOOGLE SEARCH CONSOLE VERIFICATION (app/layout.tsx)

Update the metadata export in the existing app/layout.tsx. Add the verification field and complete site-wide SEO fields. Do not remove anything already in layout.tsx — only add to the metadata object:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://www.dealdhamal.in'),
  title: {
    default: 'DealDhamal — Best Coupons, Promo Codes & Deals in India',
    template: '%s | DealDhamal',
  },
  description: 'Find the best coupon codes, promo codes, and cashback deals from top Indian brands like Flipkart, Amazon, Myntra, Swiggy, Zomato and 500+ more stores.',
  keywords: ['coupons india', 'promo codes', 'discount codes', 'cashback offers', 'deals india', 'dealdhamal', 'flipkart coupons', 'amazon coupons', 'myntra coupons'],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.dealdhamal.in',
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
    canonical: 'https://www.dealdhamal.in',
  },
}
```

Also add to the layout body just before closing </body>:
- Import GoogleAnalytics from '@next/third-parties/google'
- Render <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} /> only if NEXT_PUBLIC_GA_ID exists

---

## TASK 4 — STRUCTURED DATA COMPONENTS

Create these files in components/seo/. All are pure server components — no 'use client'. Each outputs a <script type="application/ld+json"> tag. Never output undefined or null values into the JSON — omit optional fields when empty using conditional spreading.

### components/seo/OrganizationSchema.tsx

Output this schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DealDhamal",
  "url": "https://www.dealdhamal.in",
  "logo": "https://www.dealdhamal.in/logo.png",
  "description": "India's best coupon and cashback aggregator",
  "sameAs": [
    "https://twitter.com/dealdhamal",
    "https://www.facebook.com/dealdhamal",
    "https://www.instagram.com/dealdhamal"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@dealdhamal.in",
    "contactType": "customer service"
  }
}
```

### components/seo/WebsiteSchema.tsx

Output this schema (enables Google Sitelinks Search Box):

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DealDhamal",
  "url": "https://www.dealdhamal.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.dealdhamal.in/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### components/seo/StorePageSchema.tsx

Props: store: Store, coupons: Coupon[]

Output TWO schema script tags:

Schema 1 — ItemList of coupons on the store page:
- @type: ItemList
- name: "{store.name} Coupons & Promo Codes"
- url: "https://www.dealdhamal.in/stores/{store.slug}"
- numberOfItems: coupons.length
- itemListElement: array of coupons mapped to ListItem > Offer
  - Each Offer: name = coupon.title, url = https://www.dealdhamal.in/coupons/{coupon.id}
  - Only include validThrough if coupon.expires_at is not null
  - Only include description if coupon.description is not null
  - seller: { @type: Organization, name: store.name, url: store.website_url }

Schema 2 — BreadcrumbList:
- Position 1: Home → https://www.dealdhamal.in
- Position 2: Stores → https://www.dealdhamal.in/stores
- Position 3: {store.name} Coupons → https://www.dealdhamal.in/stores/{store.slug}

### components/seo/CouponPageSchema.tsx

Props: coupon: Coupon

Output TWO schema script tags:

Schema 1 — Offer:
- @type: Offer
- name: coupon.title
- url: https://www.dealdhamal.in/coupons/{coupon.id}
- Only include description if not null
- Only include validThrough if coupon.expires_at not null
- Only include discount if coupon.discount_value not null
- seller: { @type: Organization, name: coupon.store.name, url: coupon.store.website_url }

Schema 2 — BreadcrumbList:
- Position 1: Home → https://www.dealdhamal.in
- Position 2: {coupon.store.name} → https://www.dealdhamal.in/stores/{coupon.store.slug}
- Position 3: {coupon.title} → https://www.dealdhamal.in/coupons/{coupon.id}

### components/seo/CategoryPageSchema.tsx

Props: category: Category, stores: Store[]

Output TWO schema script tags:

Schema 1 — ItemList of stores in this category:
- @type: ItemList
- name: "Best {category.name} Stores & Coupons"
- itemListElement: stores mapped to ListItem > Organization

Schema 2 — BreadcrumbList:
- Position 1: Home → https://www.dealdhamal.in
- Position 2: Categories → https://www.dealdhamal.in/categories
- Position 3: {category.name} → https://www.dealdhamal.in/categories/{category.slug}

### components/seo/HomePageSchema.tsx

Props: featuredStores: Store[]

Output ItemList of featured stores:
- @type: ItemList
- name: "Top Stores on DealDhamal"
- itemListElement: stores mapped to ListItem > Organization with url = https://www.dealdhamal.in/stores/{store.slug}

---

## TASK 5 — ADD STRUCTURED DATA TO PAGES

Update these existing page files to import and render the schema components. Add the schema component inside the page JSX, as the first child of the outermost div.

- app/layout.tsx → add <OrganizationSchema /> and <WebsiteSchema /> inside body before </body>
- app/page.tsx → add <HomePageSchema featuredStores={stores.data} />
- app/stores/[slug]/page.tsx → add <StorePageSchema store={store} coupons={coupons.data} />
- app/coupons/[id]/page.tsx → add <CouponPageSchema coupon={coupon} />
- app/categories/[slug]/page.tsx → add <CategoryPageSchema category={category} stores={stores.data} />

---

## TASK 6 — UPDATE PAGE METADATA

Update generateMetadata in these existing page files. Do not remove any existing code — only update or add the metadata export.

### app/stores/[slug]/page.tsx

```ts
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const store = await fetchStore(params.slug)
    const year = new Date().getFullYear()
    return {
      title: `${store.name} Coupons & Promo Codes ${year} — Up to ${store.cashback_rate ?? '70%'} Off`,
      description: `Get the best ${store.name} coupon codes and cashback offers for ${year}. Verified codes updated daily. Save up to ${store.cashback_rate ?? '70%'} on ${store.name}.`,
      keywords: [`${store.name} coupons`, `${store.name} promo codes`, `${store.name} discount codes`, `${store.name} offers today`],
      openGraph: {
        title: `${store.name} Coupons — Up to ${store.cashback_rate ?? '70%'} Off | DealDhamal`,
        description: `Best ${store.name} coupon codes for ${year}. Verified deals updated daily.`,
        url: `https://www.dealdhamal.in/stores/${store.slug}`,
        images: store.logo_url ? [{ url: store.logo_url, width: 400, height: 400 }] : [{ url: '/og-image.png', width: 1200, height: 630 }],
      },
      alternates: { canonical: `https://www.dealdhamal.in/stores/${store.slug}` },
    }
  } catch {
    return { title: 'Store Coupons & Deals | DealDhamal' }
  }
}
```

### app/categories/[slug]/page.tsx

```ts
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const category = await fetchCategory(params.slug)
    const year = new Date().getFullYear()
    return {
      title: `Best ${category.name} Coupons & Deals ${year} | DealDhamal`,
      description: `Find the best ${category.name} coupons and promo codes for ${year}. Browse verified offers from top ${category.name.toLowerCase()} brands in India.`,
      keywords: [`${category.name.toLowerCase()} coupons`, `${category.name.toLowerCase()} deals`, `${category.name.toLowerCase()} promo codes`],
      openGraph: {
        title: `Best ${category.name} Coupons ${year} | DealDhamal`,
        url: `https://www.dealdhamal.in/categories/${params.slug}`,
      },
      alternates: { canonical: `https://www.dealdhamal.in/categories/${params.slug}` },
    }
  } catch {
    return { title: 'Category Coupons & Deals | DealDhamal' }
  }
}
```

### app/coupons/[id]/page.tsx

```ts
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const coupon = await fetchCoupon(params.id)
    return {
      title: `${coupon.title} — ${coupon.store.name} Promo Code | DealDhamal`,
      description: `Use this ${coupon.store.name} coupon to get ${coupon.discount_value ?? 'a discount'} on your order. ${coupon.description ?? ''} Verified and working — click to reveal.`,
      openGraph: {
        title: `${coupon.title} | DealDhamal`,
        url: `https://www.dealdhamal.in/coupons/${coupon.id}`,
      },
      alternates: { canonical: `https://www.dealdhamal.in/coupons/${coupon.id}` },
    }
  } catch {
    return { title: 'Coupon Deal | DealDhamal' }
  }
}
```

### app/stores/page.tsx

```ts
export const metadata: Metadata = {
  title: 'All Stores — Coupons & Cashback Offers | DealDhamal',
  description: 'Browse coupons and cashback offers from 500+ Indian stores. Find deals from Flipkart, Amazon, Myntra, Swiggy, Zomato, Nykaa and more.',
  alternates: { canonical: 'https://www.dealdhamal.in/stores' },
}
```

### app/categories/page.tsx

```ts
export const metadata: Metadata = {
  title: 'All Categories — Fashion, Food, Travel & More | DealDhamal',
  description: 'Browse deals by category — Fashion, Electronics, Food, Beauty, Travel, Grocery and more.',
  alternates: { canonical: 'https://www.dealdhamal.in/categories' },
}
```

### app/search/page.tsx

```ts
export const metadata: Metadata = {
  title: 'Search Coupons & Deals | DealDhamal',
  robots: { index: false, follow: false },
}
```

### app/(auth)/login/page.tsx

```ts
export const metadata: Metadata = {
  title: 'Login to DealDhamal — Access Your Saved Coupons',
  description: 'Login to your DealDhamal account to access saved coupons and deal alerts.',
  robots: { index: false, follow: false },
}
```

### app/(auth)/signup/page.tsx

```ts
export const metadata: Metadata = {
  title: 'Sign Up Free — DealDhamal',
  description: 'Create a free DealDhamal account to save coupons and get deal alerts.',
  robots: { index: false, follow: false },
}
```

---

## TASK 7 — ANALYTICS TRACKING (lib/analytics.ts)

Create lib/analytics.ts with typed event tracking functions. All functions must check typeof window !== 'undefined' and typeof window.gtag !== 'undefined' before calling gtag.

```ts
export const trackEvent = (eventName: string, parameters?: Record<string, string | number | boolean>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters)
  }
}

export const trackCouponReveal = (couponId: string, storeName: string, couponType: string) =>
  trackEvent('coupon_reveal', { coupon_id: couponId, store_name: storeName, coupon_type: couponType })

export const trackCouponCopy = (couponId: string, storeName: string) =>
  trackEvent('coupon_copy', { coupon_id: couponId, store_name: storeName })

export const trackCouponClick = (couponId: string, storeName: string) =>
  trackEvent('coupon_click', { coupon_id: couponId, store_name: storeName })

export const trackCouponReport = (couponId: string, worked: boolean) =>
  trackEvent('coupon_report', { coupon_id: couponId, worked })

export const trackSearch = (query: string, resultsCount: number) =>
  trackEvent('search', { search_term: query, results_count: resultsCount })

export const trackStoreView = (storeSlug: string, storeName: string) =>
  trackEvent('store_view', { store_slug: storeSlug, store_name: storeName })

export const trackAlertSubscribe = (storeSlug?: string, categorySlug?: string) =>
  trackEvent('alert_subscribe', { store_slug: storeSlug ?? 'all', category_slug: categorySlug ?? 'all' })

export const trackSaveCoupon = (couponId: string, storeName: string) =>
  trackEvent('save_coupon', { coupon_id: couponId, store_name: storeName })
```

Add gtag type to types/index.ts:

```ts
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
  }
}
```

Integrate tracking calls into existing components:

- CouponModal.tsx: on open → trackCouponReveal, on copy → trackCouponCopy, on go to store → trackCouponClick, on report → trackCouponReport
- SearchBar.tsx: when results load → trackSearch(query, totalResults)
- hooks/useSavedCoupons.ts: on successful save mutation → trackSaveCoupon
- NewsletterBanner.tsx: on successful subscribe → trackAlertSubscribe

---

## TASK 8 — BREADCRUMB UI COMPONENT (components/ui/Breadcrumb.tsx)

Create a visual breadcrumb nav component:

Props:
```ts
interface BreadcrumbItem {
  label: string
  href?: string
}
interface BreadcrumbProps {
  items: BreadcrumbItem[]
}
```

Render as nav with aria-label="Breadcrumb", ol with flex layout, items separated by ChevronRight icon (Lucide, w-3 h-3 text-gray-400). All items except last are Next.js Link with text-sm text-gray-500 hover:text-primary. Last item is text-sm text-gray-900 font-medium with no link.

Add Breadcrumb to these pages:
- app/stores/[slug]/page.tsx → items: Home, Stores, {store.name}
- app/coupons/[id]/page.tsx → items: Home, {coupon.store.name}, {truncate(coupon.title, 40)}
- app/categories/[slug]/page.tsx → items: Home, Categories, {category.name}

---

## TASK 9 — OG IMAGE (app/opengraph-image.tsx)

Create app/opengraph-image.tsx using @vercel/og. Use edge runtime. No Node.js-only imports.

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DealDhamal — Best Coupons & Deals in India'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #E84141 0%, #FF6B35 100%)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: 'white', marginBottom: 16 }}>
          🎟️ DealDhamal
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 800 }}>
          Best Coupons, Promo Codes & Cashback Deals in India
        </div>
        <div style={{
          marginTop: 40, background: 'rgba(255,255,255,0.2)',
          borderRadius: 16, padding: '12px 32px',
          fontSize: 24, color: 'white', fontWeight: 600,
        }}>
          500+ Stores · Verified Daily · 100% Free
        </div>
      </div>
    ),
    { ...size }
  )
}
```

---

## TASK 10 — VERCEL CONFIG (vercel.json)

Create vercel.json in the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/sitemap.xml",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, stale-while-revalidate=86400" }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ],
  "redirects": [
    { "source": "/sitemap", "destination": "/sitemap.xml", "permanent": true }
  ]
}
```

---

## TASK 11 — ENV VARIABLES

Add these to .env.local.example:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=paste_your_code_from_search_console
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## IMPLEMENTATION RULES

1. All schema components are pure server components — no 'use client'
2. Never output null or undefined into JSON schema — use conditional spreading to omit empty fields
3. Sitemap wraps every fetch in try/catch — on failure logs error and returns static pages only
4. GoogleAnalytics component loads asynchronously — must not block page render
5. trackEvent checks typeof window before calling gtag — no SSR errors
6. All generateMetadata functions have try/catch — return fallback metadata on API failure
7. Breadcrumb has aria-label="Breadcrumb" on the nav element
8. OG image uses edge runtime only — no Node.js imports
9. Do not add noindex to store, category, or coupon pages — only search, login, signup, account, admin
10. Build all 11 tasks completely with fully working code — no placeholder comments
