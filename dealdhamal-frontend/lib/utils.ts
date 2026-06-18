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

