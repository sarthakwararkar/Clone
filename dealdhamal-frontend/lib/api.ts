import type {
  Category,
  Store,
  Coupon,
  PaginatedResponse,
  SearchResults,
  Alert,
  AdminStats,
  CouponFormData,
  User,
  ApiError as ApiErrorType,
  YoutubeCommentator,
  YoutubeCommentatorFormData,
} from '@/types'
import { filterValidCoupons, sanitizeCouponData } from '@/lib/utils'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    let url = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim())
      ? process.env.NEXT_PUBLIC_API_URL
      : 'https://coupondunia-backend.sarthakwararkar2.workers.dev'
    if (url.endsWith('/')) {
      url = url.slice(0, -1)
    }
    this.baseUrl = url
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    let token: string | undefined = undefined
    try {
      const { useAuthStore } = await import('@/stores/useAuthStore')
      token = useAuthStore.getState().session?.access_token ?? undefined
    } catch {
      // ignore
    }

    if (!token) {
      try {
        const { auth } = await import('@/lib/firebase')
        const firebaseUser = auth.currentUser
        if (firebaseUser) {
          token = await firebaseUser.getIdToken()
        }
      } catch {
        // ignore
      }
    }

    if (!token) {
      try {
        const mockSessionStr = localStorage.getItem('mock_firebase_session')
        if (mockSessionStr) {
          const mockData = JSON.parse(mockSessionStr)
          token = mockData.access_token
        }
      } catch {
        // ignore
      }
    }

    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    authenticated = false
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (authenticated) {
      const authHeader = await this.getAuthHeader()
      Object.assign(headers, authHeader)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const isGet = !options.method || options.method.toUpperCase() === 'GET'
    const fetchOptions: any = {
      ...options,
      headers,
      signal: controller.signal,
    }

    if (isGet && !authenticated) {
      fetchOptions.next = {
        revalidate: 300, // Cache public read-only requests for 5 minutes
        tags: [path.split('?')[0]],
        ...options.next,
      }
    }

    let res
    try {
      res = await fetch(`${this.baseUrl}${path}`, fetchOptions)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('API Request timed out after 15 seconds')
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }

    if (!res.ok) {
      let message = 'Something went wrong'
      try {
        const body = await res.json() as { message?: string; error?: string }
        message = body.message ?? body.error ?? message
      } catch {
        // ignore parse errors
      }
      throw new ApiError(message, res.status)
    }

    const body = await res.json() as any
    const sanitized = this.sanitizeImageUrls(body.data)
    if (body.pagination) {
      return {
        data: sanitized,
        total: body.pagination.total ?? 0,
        page: body.pagination.page ?? 1,
        limit: body.pagination.limit ?? 20,
        hasMore: body.pagination.hasNext ?? false,
        pagination: body.pagination,
      } as unknown as T
    }
    return sanitized
  }

  /**
   * Recursively sanitize image URL fields in API responses.
   * The backend sometimes returns relative paths like '/photos/medium/missing.png'
   * for stores without real logos — these resolve to 404s on the frontend domain.
   * This converts them to null so components fall back to initials.
   */
  private sanitizeImageUrls(data: any): any {
    if (!data) return data
    if (Array.isArray(data)) return data.map((item) => this.sanitizeImageUrls(item))
    if (typeof data === 'object') {
      const imageFields = ['logo_url', 'banner_url', 'icon_url', 'avatar_url']
      const result = { ...data }
      for (const field of imageFields) {
        if (field in result && typeof result[field] === 'string') {
          const url = result[field] as string
          // Reject relative paths, placeholder patterns, and obviously broken URLs
          if (
            !url.startsWith('http') ||
            url.includes('missing.png') ||
            url.includes('placeholder') ||
            url.includes('default-logo')
          ) {
            result[field] = null
          }
        }
      }
      // Recurse into nested objects (e.g. coupon.store)
      for (const key of Object.keys(result)) {
        if (typeof result[key] === 'object' && result[key] !== null && !imageFields.includes(key)) {
          result[key] = this.sanitizeImageUrls(result[key])
        }
      }
      return result
    }
    return data
  }

  private buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const q = new URLSearchParams()
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) q.set(key, String(val))
    }
    const str = q.toString()
    return str ? `?${str}` : ''
  }

  // ─── Public ─────────────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories')
  }

  async getStores(params: {
    category?: string
    featured?: boolean
    sort?: string
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Store>> {
    const q = this.buildQuery(params as Record<string, string | number | boolean | undefined>)
    return this.request<PaginatedResponse<Store>>(`/api/stores${q}`)
  }

  async getStore(slug: string): Promise<{ store: Store; coupons: Coupon[] }> {
    const res = await this.request<{ store: Store; coupons: Coupon[] }>(`/api/stores/${slug}`)
    if (res && Array.isArray(res.coupons)) {
      res.coupons = filterValidCoupons(res.coupons)
    }
    return res
  }

  async getCoupons(params: {
    store?: string
    category?: string
    type?: string
    featured?: boolean
    exclusive?: boolean
    sort?: string
    diverse?: boolean
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Coupon>> {
    const q = this.buildQuery(params as Record<string, string | number | boolean | undefined>)
    const res = await this.request<PaginatedResponse<Coupon>>(`/api/coupons${q}`)
    if (res && Array.isArray(res.data)) {
      res.data = filterValidCoupons(res.data)
    }
    return res
  }

  async getExclusiveDeals(limit = 16): Promise<PaginatedResponse<Coupon>> {
    const q = this.buildQuery({ exclusive: true, sort: 'latest', diverse: true, limit })
    const res = await this.request<PaginatedResponse<Coupon>>(`/api/coupons${q}`)
    if (res && Array.isArray(res.data)) {
      res.data = filterValidCoupons(res.data)
    }
    return res
  }

  async getCoupon(id: string): Promise<Coupon> {
    const res = await this.request<Coupon>(`/api/coupons/${id}`)
    return sanitizeCouponData(res)
  }

  async search(query: string): Promise<SearchResults> {
    const res = await this.request<SearchResults>(`/api/search${this.buildQuery({ q: query })}`)
    if (res && Array.isArray(res.coupons)) {
      res.coupons = filterValidCoupons(res.coupons)
    }
    return res
  }

  async clickCoupon(id: string): Promise<{ redirect_url: string }> {
    return this.request<{ redirect_url: string }>(`/api/coupons/${id}/click`, {
      method: 'POST',
    })
  }

  async reportCoupon(id: string, worked: boolean): Promise<void> {
    await this.request<unknown>(`/api/coupons/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ worked }),
    })
  }

  // ─── Authenticated ───────────────────────────────────────────────────────────

  async getMe(): Promise<User> {
    return this.request<User>('/api/me', {}, true)
  }

  async updateMe(data: { name?: string; avatar_url?: string }): Promise<User> {
    return this.request<User>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true)
  }

  async getSavedCoupons(): Promise<Coupon[]> {
    return this.request<Coupon[]>('/api/me/saved', {}, true)
  }

  async saveCoupon(id: string): Promise<void> {
    await this.request<unknown>(`/api/me/saved/${id}`, { method: 'POST' }, true)
  }

  async unsaveCoupon(id: string): Promise<void> {
    await this.request<unknown>(`/api/me/saved/${id}`, { method: 'DELETE' }, true)
  }

  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/api/alerts', {}, true)
  }

  async subscribeAlert(data: {
    email: string
    store_id?: string
    category_id?: number
  }): Promise<void> {
    await this.request<unknown>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true)
  }

  async subscribeNewsletter(email: string): Promise<void> {
    await this.request<unknown>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false)
  }

  async deleteAlert(id: string): Promise<void> {
    await this.request<unknown>(`/api/alerts/${id}`, { method: 'DELETE' }, true)
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async adminGetStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats', {}, true)
  }

  async adminGetCoupons(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Coupon>> {
    const q = this.buildQuery(params as Record<string, string | number | boolean | undefined>)
    return this.request<PaginatedResponse<Coupon>>(`/api/admin/coupons${q}`, {}, true)
  }

  async adminCreateCoupon(data: CouponFormData): Promise<Coupon> {
    return this.request<Coupon>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true)
  }

  async adminUpdateCoupon(id: string, data: Partial<CouponFormData>): Promise<Coupon> {
    return this.request<Coupon>(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true)
  }

  async adminDeleteCoupon(id: string): Promise<void> {
    await this.request<unknown>(`/api/admin/coupons/${id}`, { method: 'DELETE' }, true)
  }

  async adminCreateStore(data: FormData): Promise<Store> {
    const headers = await this.getAuthHeader()
    const res = await fetch(`${this.baseUrl}/api/admin/stores`, {
      method: 'POST',
      headers,
      body: data,
    })
    if (!res.ok) {
      const body = await res.json() as { message?: string }
      throw new ApiError(body.message ?? 'Failed to create store', res.status)
    }
    const body = await res.json() as { success: boolean; data: Store }
    return body.data
  }

  async adminUpdateStore(id: string, data: FormData): Promise<Store> {
    const headers = await this.getAuthHeader()
    const res = await fetch(`${this.baseUrl}/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers,
      body: data,
    })
    if (!res.ok) {
      const body = await res.json() as { message?: string }
      throw new ApiError(body.message ?? 'Failed to update store', res.status)
    }
    const body = await res.json() as { success: boolean; data: Store }
    return body.data
  }

  // ─── Youtube Commentators ───────────────────────────────────────────────────

  async getCommentators(): Promise<YoutubeCommentator[]> {
    return this.request<YoutubeCommentator[]>('/api/commentators')
  }

  async adminGetCommentators(): Promise<YoutubeCommentator[]> {
    return this.request<YoutubeCommentator[]>('/api/admin/commentators', {}, true)
  }

  async adminCreateCommentator(data: YoutubeCommentatorFormData): Promise<YoutubeCommentator> {
    return this.request<YoutubeCommentator>('/api/admin/commentators', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true)
  }

  async adminUpdateCommentator(id: string, data: YoutubeCommentatorFormData): Promise<YoutubeCommentator> {
    return this.request<YoutubeCommentator>(`/api/admin/commentators/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true)
  }

  async adminDeleteCommentator(id: string): Promise<void> {
    await this.request<unknown>(`/api/admin/commentators/${id}`, {
      method: 'DELETE',
    }, true)
  }

  async adminUploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const headers = await this.getAuthHeader()
    const res = await fetch(`${this.baseUrl}/api/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json() as { message?: string; error?: string }
      throw new ApiError(body.message ?? body.error ?? 'Failed to upload image', res.status)
    }

    const body = await res.json() as { success: boolean; secure_url: string }
    return body.secure_url
  }
}

export const api = new ApiClient()
export { ApiError }
export type { ApiErrorType }
