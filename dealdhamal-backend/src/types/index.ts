import type { CloudflareBindings } from '../env';

// ─── Hono App Types ─────────────────────────────────────────────────────────

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: {
    user: AuthUser | null;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  avatar_url?: string;
  provider?: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Coupon Types ───────────────────────────────────────────────────────────

export type CouponType = 'code' | 'deal' | 'cashback';
export type CouponSource = 'vcommission' | 'admitad' | 'cj' | 'manual' | 'cuelinks' | 'grabon' | 'cashkaro' | 'desidime';

export interface CouponData {
  title: string;
  description: string | null;
  code: string | null;
  coupon_type: CouponType;
  discount_value: string;
  affiliate_url: string;
  source: CouponSource;
  external_id: string;
  store_slug: string;
  store_name?: string;         // Human-readable name from affiliate network
  store_logo_url?: string;     // Logo from affiliate network (e.g. Admitad campaign logo)
  store_banner_url?: string;   // Banner image from affiliate network
  store_website_url?: string;  // Merchant website from affiliate network
  starts_at: Date | null;
  expires_at: Date | null;
  is_exclusive: boolean;
}

export interface CouponResponse {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  code: string | null;
  coupon_type: CouponType;
  discount_value: string;
  affiliate_url: string;
  source: string | null;
  is_verified: boolean;
  is_exclusive: boolean;
  is_featured: boolean;
  expires_at: string | null;
  starts_at: string | null;
  success_rate: number;
  used_count: number;
  created_at: string;
  store?: StoreResponse;
}

export interface CouponCreateInput {
  store_id: string;
  title: string;
  description?: string;
  code?: string;
  coupon_type: CouponType;
  discount_value: string;
  affiliate_url: string;
  source?: CouponSource;
  external_id?: string;
  is_verified?: boolean;
  is_exclusive?: boolean;
  is_featured?: boolean;
  starts_at?: string;
  expires_at?: string;
}

export interface CouponUpdateInput {
  title?: string;
  description?: string;
  code?: string;
  coupon_type?: CouponType;
  discount_value?: string;
  affiliate_url?: string;
  is_verified?: boolean;
  is_exclusive?: boolean;
  is_featured?: boolean;
  starts_at?: string;
  expires_at?: string;
}

// ─── Store Types ────────────────────────────────────────────────────────────

export interface StoreResponse {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  affiliate_network: string | null;
  description: string | null;
  category_id: number | null;
  is_featured: boolean;
  cashback_rate: string | null;
  created_at: string;
  coupon_count?: number;
  deal_count?: number;
}

export interface StoreCreateInput {
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  website_url?: string;
  affiliate_url?: string;
  affiliate_network?: string;
  description?: string;
  category_id?: number;
  is_featured?: boolean;
  cashback_rate?: string;
}

export interface StoreUpdateInput {
  name?: string;
  slug?: string;
  logo_url?: string;
  banner_url?: string;
  website_url?: string;
  affiliate_url?: string;
  affiliate_network?: string;
  description?: string;
  category_id?: number;
  is_featured?: boolean;
  cashback_rate?: string;
}

// ─── Category Types ─────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  created_at: string;
}

// ─── User Types ─────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  provider: string;
  created_at: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar_url?: string;
}

// ─── Deal Alert Types ───────────────────────────────────────────────────────

export interface DealAlertCreateInput {
  email: string;
  store_id?: string;
  category_id?: number;
}

export interface DealAlertResponse {
  id: string;
  email: string;
  store_id: string | null;
  category_id: number | null;
  is_active: boolean;
  created_at: string;
}

// ─── Search Types ───────────────────────────────────────────────────────────

export interface SearchResult {
  coupons: CouponResponse[];
  stores: StoreResponse[];
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
  message?: string;
}

export interface ClickResponse {
  redirect_url: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  environment: string;
}
