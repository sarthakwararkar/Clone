export interface User {
  id: string
  supabase_uid: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  provider?: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon_url: string | null
}

export interface Store {
  id: string
  name: string
  slug: string
  logo_url: string | null
  banner_url: string | null
  website_url: string | null
  affiliate_url: string | null
  affiliate_network: string | null
  description: string | null
  category_id: number | null
  is_featured: boolean
  cashback_rate: string | null
  coupon_count?: number
  category?: Category
  created_at: string
}

export interface Coupon {
  id: string
  store_id: string
  title: string
  description: string | null
  code: string | null
  coupon_type: 'code' | 'deal' | 'cashback'
  discount_value: string | null
  affiliate_url: string
  source: string | null
  is_verified: boolean
  is_exclusive: boolean
  is_featured: boolean
  expires_at: string | null
  success_rate: number
  used_count: number
  store: Store
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SearchResults {
  coupons: Coupon[]
  stores: Store[]
}

export interface Alert {
  id: string
  email: string
  store_id: string | null
  category_id: number | null
  is_active: boolean
  store?: Store
  category?: Category
}

export interface AdminStats {
  totalCoupons: number
  totalStores: number
  totalUsers: number
  expiringThisWeek: number
}

export interface CouponFormData {
  store_id: string
  title: string
  description?: string
  coupon_type: 'code' | 'deal' | 'cashback'
  code?: string
  discount_value?: string
  affiliate_url: string
  expires_at?: string
  is_verified: boolean
  is_featured: boolean
  is_exclusive: boolean
}

export interface ApiError {
  status: number
  message: string
}

export interface YoutubeCommentator {
  id: string
  name: string
  youtube_handle: string | null
  avatar_url: string | null
  channel_url: string | null
  comment_text: string | null
  is_featured: boolean
  created_at: string
  updated_at?: string | null
}

export interface YoutubeCommentatorFormData {
  name: string
  youtube_handle?: string | null
  avatar_url?: string | null
  channel_url?: string | null
  comment_text?: string | null
  is_featured?: boolean
}

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
  }
}
