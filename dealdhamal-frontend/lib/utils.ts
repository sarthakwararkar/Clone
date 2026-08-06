import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDiscount(value: string | null): string {
  return value ?? 'Special Offer'
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffDays) === 0) return 'Today'
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute')
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day')
  if (Math.abs(diffWeeks) < 4) return rtf.format(diffWeeks, 'week')
  return rtf.format(diffMonths, 'month')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function maskCode(code: string): string {
  if (code.length <= 5) return code
  const first = code.slice(0, 3)
  const last = code.slice(-2)
  const middle = '•'.repeat(Math.max(code.length - 5, 2))
  return `${first}${middle}${last}`
}

export function formatNumber(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return String(n)
}

export function ensureExternalLink(url: string | null | undefined): string {
  if (!url) return '#'
  let trimmed = url.trim()
  if (trimmed.startsWith('http://')) {
    trimmed = 'https://' + trimmed.slice(7)
  }
  if (trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function getOutboundLink(
  affiliateUrl: string | null | undefined,
  websiteUrl: string | null | undefined,
  storeSlug?: string
): string {
  // 1. Check if affiliateUrl is a valid external URL
  if (affiliateUrl) {
    let trimmed = affiliateUrl.trim()
    if (trimmed.startsWith('http://')) {
      trimmed = 'https://' + trimmed.slice(7)
    }
    if (trimmed.startsWith('https://')) {
      return trimmed
    }
  }

  // 2. Fall back to websiteUrl if it looks like a valid URL or domain
  if (websiteUrl) {
    let trimmed = websiteUrl.trim()
    if (trimmed.startsWith('http://')) {
      trimmed = 'https://' + trimmed.slice(7)
    }
    if (trimmed && !trimmed.includes('_AFFILIATE_URL') && !trimmed.includes('your_')) {
      return ensureExternalLink(trimmed)
    }
  }

  // 3. If both are missing or placeholders, try to construct one from the slug as a fallback
  if (storeSlug) {
    const cleanSlug = storeSlug.toLowerCase().trim()
    if (cleanSlug) {
      if (cleanSlug.includes('amazon')) return 'https://www.amazon.in'
      if (cleanSlug.includes('flipkart')) return 'https://www.flipkart.com'
      if (cleanSlug.includes('myntra')) return 'https://www.myntra.com'
      if (cleanSlug.includes('ajio')) return 'https://www.ajio.com'
      if (cleanSlug.includes('zomato')) return 'https://www.zomato.com'
      if (cleanSlug.includes('swiggy')) return 'https://www.swiggy.com'
      return `https://www.${cleanSlug}.com`
    }
  }

  return '#'
}

export interface ExpiryInfo {
  text: string
  isExpired: boolean
  isUrgent: boolean
}

export function formatAddedDate(dateStr?: string | null): string {
  if (!dateStr) return 'Added Recently'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Added Recently'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Added Today'

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `Added ${Math.max(1, diffMins)}m ago`
  if (diffHours < 24) return `Added ${diffHours}h ago`
  if (diffDays === 1) return 'Added Yesterday'
  if (diffDays < 30) return `Added ${diffDays}d ago`

  return `Added ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function formatExpiryInfo(dateStr?: string | null): ExpiryInfo {
  if (!dateStr) {
    return { text: 'Ongoing Offer', isExpired: false, isUrgent: false }
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return { text: 'Ongoing Offer', isExpired: false, isUrgent: false }
  }

  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { text: 'Expired', isExpired: true, isUrgent: false }
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 24) {
    const hrs = Math.max(1, diffHours)
    return { text: `Expires in ${hrs}h`, isExpired: false, isUrgent: true }
  }

  if (diffDays < 30) {
    return { text: `Expires in ${diffDays}d`, isExpired: false, isUrgent: diffDays <= 3 }
  }

  return {
    text: `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    isExpired: false,
    isUrgent: false,
  }
}

export function sanitizeTitleText(title: string | null | undefined): string {
  if (!title) return ''
  return title
    .replace(/[\uFFFD\uFFFE\uFFFF\u00EF\u00BF\u00BD]/g, '')
    .replace(/\?\?/g, '')
    .replace(/^\?+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeCouponData<T extends {
  title?: string
  code?: string | null
  expires_at?: string | null
  affiliate_url?: string | null
  store?: any
}>(coupon: T): T {
  if (!coupon || typeof coupon !== 'object') return coupon

  // Clean title encoding artifacts
  if (coupon.title) {
    coupon.title = sanitizeTitleText(coupon.title)
  }

  // Handle fake placeholder codes — comprehensive list
  if (coupon.code) {
    const codeUpper = coupon.code.trim().toUpperCase()
    const fakeCodeWords = [
      'BEST OFFER', 'BEST-OFFER', 'NO-CODE', 'NOCODE', 'DEAL', 'OFFER',
      'GETDEAL', 'GET DEAL', 'CLICK', 'LINK', 'NONE', 'N/A', 'APPLY',
      'SHOW CODE', 'SHOWCODE', 'SPECIAL', 'COUPON', 'GETCODE', 'GET CODE',
      'ACTIVATE', 'REDEEM', 'SAVE', 'DISCOUNT', 'BUY NOW', 'BUY-NOW',
      'ORDER', 'CHECKOUT', 'GRAB', 'HURRY', 'LIMITED', 'EXCLUSIVE',
      'ACTIVATE OFFER', 'VIEW DEAL', 'UNLOCK', 'REVEAL', 'REVEAL CODE',
      'GRAB DEAL', 'GRAB OFFER', 'SHOP NOW', 'SHOP-NOW', 'VIEW OFFER',
      'CLAIM', 'CLAIM NOW', 'CLAIM DEAL', 'CLAIM OFFER', 'AVAIL',
      'AVAIL NOW', 'AVAIL OFFER', 'USE CODE', 'PROMO', 'CODE',
      'NOT REQUIRED', 'NOT NEEDED', 'NO CODE NEEDED', 'NO COUPON',
      'AUTO APPLIED', 'AUTO-APPLIED', 'ACTIVATED', 'SEE DEAL',
    ]
    if (fakeCodeWords.includes(codeUpper) || codeUpper.length < 3 || codeUpper.length > 30) {
      coupon.code = null
    }
  }

  // Clean affiliate URL if it's a scraper template or placeholder
  if (coupon.affiliate_url) {
    const lowerUrl = coupon.affiliate_url.toLowerCase().trim()
    if (
      lowerUrl.includes('cuelinks_affiliate_url') ||
      lowerUrl.includes('vcommission_') ||
      lowerUrl.includes('grabon.in') ||
      lowerUrl.includes('coupondunia.in') ||
      lowerUrl.includes('desidime.com') ||
      lowerUrl.includes('_affiliate_url') ||
      lowerUrl.includes('your_affiliate_link') ||
      lowerUrl.includes('example.com') ||
      lowerUrl.includes('placeholder') ||
      lowerUrl.includes('couponraja') ||
      lowerUrl.includes('promocodeclub') ||
      !lowerUrl.startsWith('http')
    ) {
      // Fallback to store website or store affiliate URL if available
      coupon.affiliate_url = getOutboundLink(null, coupon.store?.website_url || coupon.store?.affiliate_url, coupon.store?.slug)
    }
  }

  return coupon
}

// Regex patterns for fake coupon detection
const DISCOUNT_ONLY_TITLE_RE = /^(flat\s+)?(up\s*to\s+)?(get\s+)?\d+%?\s*(off|discount|cashback|savings?|deal|offer)?\.?$/i
const ENCODING_GARBAGE_RE = /[\uFFFD]{2,}|ï¿½|\?{3,}|â€|Ã|&#\d{3,};/
const COMPETITOR_SITES = [
  'coupondunia', 'grabon', 'cashkaro', 'desidime', 'couponraja',
  'promocodeclub', 'couponzeta', 'freekaamaal', 'dealsshutter',
  'couponmachine', 'pennyful', 'ndtv gadgets', 'offers.com',
]

export function filterValidCoupons<T extends {
  title?: string
  description?: string | null
  code?: string | null
  expires_at?: string | null
  affiliate_url?: string | null
  store?: { name?: string; slug?: string } | null
}>(coupons: T[]): T[] {
  if (!Array.isArray(coupons)) return []
  const now = Date.now()

  // Major brand codes to prevent store mismatch bugs (e.g. CAMPUS10 or MEESHO30 on Nykaa)
  const brandKeywords = [
    'campus', 'meesho', 'ajio', 'myntra', 'swiggy', 'zomato',
    'amazon', 'flipkart', 'nykaa', 'blinkit', 'zepto', 'croma',
    'boat', 'puma', 'nike', 'adidas', 'mamaearth', 'lenskart',
    'tata', 'jio', 'paytm', 'phonepe', 'bigbasket', 'dunzo',
    'uber', 'ola', 'makemytrip', 'goibibo', 'yatra', 'cleartrip',
    'bewakoof', 'souled', 'snitch', 'clovia', 'nnnow', 'h&m',
  ]

  return coupons
    .map((c) => sanitizeCouponData(c))
    .filter((coupon) => {
      if (!coupon || typeof coupon !== 'object') return false

      const title = coupon.title?.trim()
      if (!title || title.length < 5) return false

      const lowerTitle = title.toLowerCase()

      // 1. Reject known test/fake/placeholder titles
      if (
        lowerTitle === 'test' ||
        lowerTitle === 'asdf' ||
        lowerTitle === 'fake coupon' ||
        lowerTitle === 'sample coupon' ||
        lowerTitle === 'dummy deal' ||
        lowerTitle === 'test coupon' ||
        lowerTitle === 'untitled offer' ||
        lowerTitle === 'untitled' ||
        lowerTitle.includes('dummy') ||
        lowerTitle.includes('lorem ipsum') ||
        lowerTitle.includes('placeholder')
      ) {
        return false
      }

      // 2. Reject discount-only titles (e.g. "10% OFF", "Flat 50% Discount")
      if (DISCOUNT_ONLY_TITLE_RE.test(title) && title.length < 25) {
        return false
      }

      // 3. Reject titles with encoding garbage
      if (ENCODING_GARBAGE_RE.test(title)) {
        return false
      }

      // 4. Reject titles mentioning competitor coupon sites (scraped metadata)
      if (COMPETITOR_SITES.some((site) => lowerTitle.includes(site))) {
        return false
      }

      // 5. Reject generic CTA-only titles
      const ctaTitles = [
        'get deal', 'get code', 'grab deal', 'click here', 'shop now',
        'show code', 'reveal code', 'grab offer', 'view deal', 'see deal',
        'activate offer', 'claim now', 'avail offer', 'buy now',
        'sign up', 'signup', 'register now', 'join now',
      ]
      if (ctaTitles.includes(lowerTitle)) {
        return false
      }

      // 6. Reject titles that are just a store name repeated
      const storeName = (coupon.store?.name || '').toLowerCase().trim()
      if (storeName && (lowerTitle === storeName || lowerTitle === `${storeName} offer` || lowerTitle === `${storeName} deal`)) {
        return false
      }

      // 7. Strict Expiry check: filter out expired deals
      if (coupon.expires_at) {
        const expTime = new Date(coupon.expires_at).getTime()
        if (!isNaN(expTime) && expTime < now) {
          return false
        }
      }

      // 8. Reject coupons with broken/missing affiliate URLs
      if (coupon.affiliate_url) {
        const url = coupon.affiliate_url.trim().toLowerCase()
        if (url === '#' || url === '' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          return false
        }
      }

      // 9. Code & Store Mismatch Check (expanded brand list)
      if (coupon.code) {
        const codeUpper = coupon.code.trim().toUpperCase()
        const storeNameLower = storeName
        const storeSlugLower = (coupon.store?.slug || '').toLowerCase()
        const codeLower = codeUpper.toLowerCase()

        for (const brand of brandKeywords) {
          if (codeLower.includes(brand)) {
            // Must match the store name/slug for that brand
            if (!storeNameLower.includes(brand) && !storeSlugLower.includes(brand)) {
              return false // Mismatched fake/scraped coupon!
            }
          }
        }
      }

      // 10. Reject excessively long titles (likely scraped page content)
      if (title.length > 200) {
        return false
      }

      return true
    })
}


