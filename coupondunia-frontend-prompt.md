# CouponDunia Clone — Frontend Prompt for Antigravity

You are a senior frontend engineer. Build a production-ready CouponDunia clone frontend — a coupon & cashback aggregator for India. This is a pixel-perfect, fully functional frontend that connects to the backend API already built on Cloudflare Workers + Hono.

---

## TECH STACK — zero deviations

- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS v3
- State Management: Zustand
- Server State / Data Fetching: TanStack Query v5 (React Query)
- Auth: Supabase Auth (@supabase/ssr for Next.js App Router)
- Forms: React Hook Form + Zod validation
- Icons: Lucide React
- Toasts / Notifications: Sonner
- Image Optimization: Next.js Image component
- Image Hosting: Cloudinary (store logos, banners — free, no card required)
- SEO: Next.js Metadata API (generateMetadata per page)
- Analytics: Vercel Analytics (free tier)
- Deployment: Vercel (free tier)

---

## ENVIRONMENT VARIABLES (.env.local)

```
NEXT_PUBLIC_API_URL=https://coupondunia-backend.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=coupondunia_unsigned
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## PROJECT STRUCTURE

Generate this exact folder layout:

```
coupondunia-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── stores/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── coupons/
│   │   └── [id]/page.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── account/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── saved/page.tsx
│   │   └── alerts/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── coupons/page.tsx
│       ├── coupons/new/page.tsx
│       ├── coupons/[id]/edit/page.tsx
│       ├── stores/page.tsx
│       └── stores/new/page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── Providers.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── FeaturedStores.tsx
│   │   ├── TrendingCoupons.tsx
│   │   ├── CategoryGrid.tsx
│   │   └── NewsletterBanner.tsx
│   ├── coupons/
│   │   ├── CouponCard.tsx
│   │   ├── CouponGrid.tsx
│   │   ├── CouponList.tsx
│   │   ├── CouponModal.tsx
│   │   ├── CouponFilters.tsx
│   │   └── CouponReportButton.tsx
│   ├── stores/
│   │   ├── StoreCard.tsx
│   │   ├── StoreGrid.tsx
│   │   ├── StoreHeader.tsx
│   │   └── StoreCashbackBadge.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchDropdown.tsx
│   │   └── SearchResults.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── OAuthButtons.tsx
│   │   └── AuthGuard.tsx
│   ├── account/
│   │   ├── AccountSidebar.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── SavedCouponsList.tsx
│   │   └── AlertsList.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── StatsCards.tsx
│   │   ├── CouponTable.tsx
│   │   ├── StoreTable.tsx
│   │   ├── CouponForm.tsx
│   │   └── StoreForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Skeleton.tsx
│       ├── Pagination.tsx
│       ├── EmptyState.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCoupons.ts
│   ├── useStores.ts
│   ├── useCategories.ts
│   ├── useSearch.ts
│   ├── useSavedCoupons.ts
│   ├── useDealAlerts.ts
│   └── useCloudinaryUpload.ts
├── lib/
│   ├── api.ts
│   ├── cloudinary.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── queryClient.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── public/
│   ├── logo.svg
│   └── og-image.png
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

---

## DESIGN SYSTEM

Add all colors to tailwind.config.ts as custom colors AND as CSS variables in globals.css.

Colors:
- primary: #E84141 (CouponDunia red — CTAs, badges, highlights)
- primary-dark: #C62F2F (hover states)
- primary-light: #FFF0F0 (light tint backgrounds)
- accent: #FF6B35 (orange — cashback badges, featured labels)
- success: #22C55E
- warning: #F59E0B
- background: #F5F5F5 (page background)
- card: #FFFFFF
- text-primary: #1A1A1A
- text-secondary: #6B7280

Typography:
- Font: Inter via next/font/google, applied to html element in layout.tsx
- Headings: font-bold tracking-tight
- Body: font-normal leading-relaxed

Border radius: cards = rounded-xl, buttons = rounded-lg, badges = rounded-full
Shadows: cards = shadow-sm hover:shadow-md transition-shadow, modal = shadow-2xl

---

## TYPESCRIPT TYPES (types/index.ts)

Define all interfaces to match the backend Drizzle schema exactly:

```ts
export interface User {
  id: string
  supabase_uid: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
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
```

---

## LIB FILES — implement fully

### lib/cloudinary.ts

Unsigned upload helper — no backend call needed:

```ts
export const uploadToCloudinary = async (
  file: File,
  folder: 'stores' | 'banners' | 'avatars'
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', `coupondunia/${folder}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return data.secure_url as string
}
```

### lib/api.ts

Typed API client class. Automatically attaches Supabase session JWT as Authorization: Bearer {token} on every request when user is logged in. Gets session from Supabase browser client.

Implement class ApiClient with these methods — all fully typed, all throw ApiError on non-2xx:

- getCategories(): Promise<Category[]>
- getStores(params: { category?: string; featured?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<Store>>
- getStore(slug: string): Promise<Store>
- getCoupons(params: { store?: string; category?: string; type?: string; featured?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>>
- getCoupon(id: string): Promise<Coupon>
- search(query: string): Promise<SearchResults>
- clickCoupon(id: string): Promise<{ redirect_url: string }>
- reportCoupon(id: string, worked: boolean): Promise<void>
- getMe(): Promise<User>
- updateMe(data: { name?: string; avatar_url?: string }): Promise<User>
- getSavedCoupons(): Promise<Coupon[]>
- saveCoupon(id: string): Promise<void>
- unsaveCoupon(id: string): Promise<void>
- getAlerts(): Promise<Alert[]>
- subscribeAlert(data: { email: string; store_id?: string; category_id?: number }): Promise<void>
- deleteAlert(id: string): Promise<void>
- adminGetStats(): Promise<AdminStats>
- adminGetCoupons(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>>
- adminCreateCoupon(data: CouponFormData): Promise<Coupon>
- adminUpdateCoupon(id: string, data: Partial<CouponFormData>): Promise<Coupon>
- adminDeleteCoupon(id: string): Promise<void>
- adminCreateStore(data: FormData): Promise<Store>
- adminUpdateStore(id: string, data: FormData): Promise<Store>

Export a singleton: export const api = new ApiClient()

### lib/utils.ts

Implement these utility functions:

- cn(...classes): string — clsx + tailwind-merge for conditional class names
- formatDiscount(value: string | null): string — returns value or "Special Offer"
- timeAgo(dateStr: string): string — "2 days ago", "in 3 days", "Today" using Intl.RelativeTimeFormat
- truncate(str: string, maxLength: number): string
- maskCode(code: string): string — shows first 3 and last 2 chars, masks middle with bullets e.g. "SAV••••30"
- formatNumber(n: number): string — "1.2k" for 1200+, else plain number

### lib/queryClient.ts

TanStack Query client with stale times:
- categories: staleTime 1 hour
- stores: staleTime 30 minutes
- coupons: staleTime 10 minutes
- search: staleTime 5 minutes

### lib/supabase/client.ts

createBrowserClient from @supabase/ssr using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

### lib/supabase/server.ts

createServerClient from @supabase/ssr using cookies() from next/headers.

---

## ZUSTAND STORES — implement all

### stores/useAuthStore.ts
State: user: User | null, session: Session | null, isLoading: boolean
Actions: setUser(user, session), clearUser(), setLoading(b)

### stores/useCouponFilterStore.ts
State: type: 'all' | 'code' | 'deal' | 'cashback', sortBy: 'featured' | 'newest' | 'popular'
Actions: setType(type), setSortBy(sort), reset()

### stores/useSearchStore.ts
State: query: string, isDropdownOpen: boolean
Actions: setQuery(q), openDropdown(), closeDropdown()

---

## HOOKS — implement all

### hooks/useAuth.ts
- Listen to supabase.auth.onAuthStateChange
- On change: fetch /api/me if session exists, sync to useAuthStore
- Expose: user, session, isLoading, role
- signInWithGoogle(): calls supabase.auth.signInWithOAuth({ provider: 'google' })
- signInWithEmail(email, password): calls supabase.auth.signInWithPassword
- signUp(email, password, name): calls supabase.auth.signUp then PATCH /api/me with name
- signOut(): calls supabase.auth.signOut then clearUser()

### hooks/useCoupons.ts
useQuery wrapping api.getCoupons(params). Query key includes all params.

### hooks/useStores.ts
useQuery wrapping api.getStores(params).

### hooks/useCategories.ts
useQuery wrapping api.getCategories(). StaleTime 1 hour.

### hooks/useSearch.ts
- Takes query string as input
- useQuery with enabled: query.length > 1
- Returns { results, isLoading, isError }

### hooks/useSavedCoupons.ts
- useQuery for fetching saved coupons list
- useMutation for save: calls api.saveCoupon(id), optimistically updates query cache
- useMutation for unsave: calls api.unsaveCoupon(id), optimistically updates
- isSaved(couponId: string): boolean helper

### hooks/useDealAlerts.ts
- useQuery for fetching alerts
- useMutation for subscribe and unsubscribe

### hooks/useCloudinaryUpload.ts
- State: uploading, progress (0–100), error
- Uses XMLHttpRequest (not fetch) for upload progress events
- upload(file: File, folder): Promise<string>
- Returns { upload, uploading, progress, error, reset }

---

## COMPONENT SPECIFICATIONS — implement every component fully

### components/ui/Button.tsx
Variants: primary (red bg, white text), secondary (white bg, red border + text), ghost (transparent, gray text)
Sizes: sm, md (default), lg
Props: variant, size, loading (shows spinner), disabled, onClick, type, className, children
Loading state: shows Lucide Loader2 spinning icon, disables button

### components/ui/Badge.tsx
Variants mapped to coupon_type:
- code: red bg (#E84141) white text "CODE"
- deal: green bg white text "DEAL"
- cashback: orange bg (#FF6B35) white text "CASHBACK"
- exclusive: purple bg white text "EXCLUSIVE"
- verified: blue bg white text + checkmark icon "VERIFIED"
All badges: rounded-full, text-xs, font-semibold, px-2 py-0.5

### components/ui/Skeleton.tsx
Animated pulse placeholder. Props: className, width, height, rounded
Use for all loading states.

### components/ui/Modal.tsx
Base modal component:
- Fixed overlay with backdrop blur and semi-transparent black bg
- Centered card (max-w-md by default, configurable)
- Close button top-right (X icon)
- ESC key closes
- Backdrop click closes
- Focus trap while open
- Animate in: scale from 95% + fade in, 200ms ease-out
Props: isOpen, onClose, title, children, maxWidth

### components/ui/Pagination.tsx
Props: page, totalPages, onPageChange
Shows: Previous button, page numbers (with ellipsis for large ranges), Next button
Current page highlighted in red

### components/ui/EmptyState.tsx
Props: icon (Lucide icon), title, description, actionLabel, onAction
Centered layout with large icon (gray), bold title, gray description, optional action button

### components/coupons/CouponCard.tsx
Props: coupon: Coupon, view: 'grid' | 'list', isSaved?: boolean

LIST VIEW (horizontal, full width):
- Left column (w-16): Store logo — Next.js Image 48x48, rounded-lg, object-contain, border border-gray-100, white bg. If logo_url null: colored div with store name initials (2 chars, uppercase)
- Center column (flex-1 px-4):
  - Store name: text-sm text-gray-500, hover:text-primary, links to /stores/{store.slug}
  - Title: text-base font-semibold text-gray-900 line-clamp-2 mt-0.5
  - Badge row mt-1.5: Badge for coupon_type + "EXCLUSIVE" badge if is_exclusive + "VERIFIED" badge if is_verified
  - Expiry line mt-1: expires_at → "Expires {timeAgo(expires_at)}" text-xs text-gray-400 with clock icon; null → "No Expiry" text-xs text-green-500 with checkmark icon
  - Success rate mt-1.5: if success_rate > 0 → gray progress bar (w-24 h-1.5 rounded-full) filled to success_rate% in green + "{success_rate}% success" text-xs text-gray-400
- Right column (w-40 flex flex-col items-end gap-2):
  - "{used_count} used" text-xs text-gray-400
  - CODE type: dashed border box (border-2 border-dashed border-primary rounded-lg px-3 py-2 cursor-pointer hover:bg-primary-light) showing maskCode(coupon.code) in font-mono text-sm font-semibold text-primary + "Tap to reveal" text-xs below
  - DEAL/CASHBACK type: Button variant=primary size=sm "Get Deal →"
  - Bookmark icon (Lucide Bookmark): w-5 h-5, filled red if isSaved, outline gray if not. onClick: toggle save/unsave. If not logged in: redirect to /login with toast "Login to save coupons"

GRID VIEW (vertical card):
- Store logo centered top (64x64)
- Store name text-center text-sm text-gray-500 mt-2
- Title text-center text-sm font-semibold line-clamp-2 mt-1
- Badge centered mt-1
- Full-width button at bottom mt-3 (CODE → "Reveal Code", DEAL → "Get Deal")
- Bookmark icon top-right absolute

Both views: whole card is white bg, rounded-xl, p-4, shadow-sm hover:shadow-md cursor-pointer transition-all. Card click (not on buttons) navigates to /coupons/{id}

### components/coupons/CouponModal.tsx
Triggered by clicking reveal code on CouponCard. Uses base Modal.tsx.

Full implementation:
1. On mount: fire POST /api/coupons/:id/click (fire and forget)
2. Header: store logo (40x40) + store name
3. Label "Your Coupon Code" text-sm text-gray-500
4. Code display: large monospace box — bg-gray-50 border-2 border-dashed border-primary rounded-xl p-6 text-center, code in text-3xl font-mono font-bold text-primary tracking-widest
5. "Copy Code" button (full width, secondary variant): on click copies code to clipboard, text changes to "✓ Copied!" for 2 seconds, show success toast
6. "Go to {store.name}" button (full width, primary variant): opens affiliate_url in new tab
7. Divider with "Did this work?" text
8. Two buttons side by side: 👍 "Worked!" and 👎 "Didn't Work"
9. On either click: POST /api/coupons/:id/report { worked }, replace buttons with "Thanks for your feedback! 🙏" text
10. Countdown footer: "Auto-closing in {n}s" — counts from 60 to 0 then closes modal
11. ESC and backdrop click also close

### components/coupons/CouponFilters.tsx
Horizontal scrollable filter bar (no wrap on mobile):
- Type filters: "All" | "Codes" | "Deals" | "Cashback" — pill buttons, selected = red bg
- Sort dropdown: "Featured" | "Newest" | "Most Used"
- All selections update useCouponFilterStore
- Active filter count badge on mobile (e.g. "2 Filters")

### components/stores/StoreCard.tsx
White card rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4:
- Cloudinary logo: Next.js Image 80x80 object-contain mx-auto, white bg, rounded-xl border border-gray-100, p-2
- If logo null: large colored circle with initials
- Store name: font-semibold text-center mt-3
- StoreCashbackBadge if cashback_rate exists: centered
- Coupon count: text-sm text-gray-500 text-center mt-1
- Entire card wraps in Next.js Link to /stores/{slug}

### components/stores/StoreHeader.tsx
Full-width store hero section:
- Light gray bg (bg-gray-50), border-b
- Container: flex layout, store logo large (96x96) left, info right
- Logo: Cloudinary image, white bg card, rounded-2xl, shadow-sm
- Store name: h1 text-2xl font-bold
- Description: text-gray-600 mt-1 max-w-prose
- StoreCashbackBadge if applicable
- "Visit Store" button (primary): opens store.affiliate_url in new tab, tracks click
- Coupon count chip: "{n} active coupons"

### components/home/HeroBanner.tsx
No external library. Implement with useState + useEffect:
- Props: coupons: Coupon[] (use first 4-5 featured coupons)
- Each slide: full gradient background (from-red-600 via-red-500 to-orange-500), rounded-2xl, overflow-hidden, h-64 md:h-80
- Slide content left: store name chip (white/20 bg), deal title (text-2xl md:text-3xl font-bold text-white), discount badge (white bg red text), CTA button (white bg red text "Get Deal")
- Slide content right: store logo in white card (rounded-2xl shadow-lg) — only on md+
- Auto-advance every 5 seconds, pauses on hover (onMouseEnter/Leave)
- Dot indicators: small circles at bottom center, active = white, inactive = white/50
- Prev/Next arrow buttons (white/20 bg, rounded-full) on desktop sides
- Transition: CSS opacity transition 400ms

### components/home/CategoryGrid.tsx
Props: categories: Category[]
8 categories max in grid: grid-cols-4 md:grid-cols-8 gap-3
Each item: Link to /categories/{slug}
Card: white bg rounded-xl p-3 text-center shadow-sm hover:shadow-md hover:border-primary border border-transparent transition-all
Icon: if icon_url exists use Cloudinary image (32x32), else use a colored emoji/icon based on category name
Name: text-xs font-medium text-gray-700 mt-2

### components/search/SearchBar.tsx
Desktop (md+):
- Input: w-full max-w-lg rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 pr-10
- Search icon (Lucide Search) absolute left inside input
- Clear button (Lucide X) absolute right, only visible when query.length > 0
- SearchDropdown renders below when isDropdownOpen && query.length > 1
- Click outside: useEffect with document.addEventListener('mousedown') to close

Mobile:
- Shows search icon button in header
- On click: full-screen overlay with search input focused at top
- Results appear below in scrollable list

Debounce: 350ms using useCallback + setTimeout/clearTimeout pattern (no external debounce lib)
Query syncs to useSearchStore.

### components/search/SearchDropdown.tsx
Absolute positioned card below search bar (top-full left-0 right-0 mt-2 z-50):
- White bg, rounded-xl, shadow-xl, border border-gray-100, max-h-96 overflow-y-auto
- Loading state: 3 skeleton rows
- Stores section (if results.stores.length > 0):
  - Section header: "Stores" text-xs font-semibold text-gray-400 uppercase px-4 py-2
  - Up to 3 store rows: flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer
    - Cloudinary logo 28x28 rounded-md
    - Store name text-sm font-medium
    - Coupon count text-xs text-gray-400
- Coupons section (if results.coupons.length > 0):
  - Section header: "Coupons"
  - Up to 5 coupon rows: store name text-xs text-gray-400 + coupon title text-sm + discount badge
- Footer: "See all results for '{query}' →" — full-width, text-center, text-sm text-primary, py-3, border-t
- No results: centered "No results for '{query}'" text-sm text-gray-500 py-6
- Keyboard nav: highlighted row has bg-gray-50, managed with selectedIndex state

### components/auth/LoginForm.tsx
React Hook Form + Zod schema:
- email: z.string().email()
- password: z.string().min(6)
Fields: Email input, Password input (with show/hide toggle — Lucide Eye/EyeOff), Submit button
Error display: red text below each invalid field (form.formState.errors)
On submit: call useAuth signInWithEmail, on success redirect to /, on error show toast with error message
"Don't have an account? Sign up" link to /signup

### components/auth/OAuthButtons.tsx
Google button: white bg, border, Google logo SVG (inline), "Continue with Google" text
On click: call useAuth signInWithGoogle

### components/admin/StoreForm.tsx
Full form for creating/editing a store. React Hook Form + Zod.

Fields:
- Store Name (required text)
- Slug (auto-generated from name, editable text)
- Website URL (URL)
- Affiliate URL (URL, required)
- Affiliate Network (select: vcommission / admitad / cj / manual)
- Category (select from categories list)
- Description (textarea)
- Cashback Rate (text, e.g. "Up to 8%")
- Is Featured (toggle switch)
- Logo Upload:
  - Drag-and-drop zone: dashed border rounded-xl, upload icon, "Click or drag store logo here" text, "PNG, JPG, WebP up to 2MB" subtext
  - On file select: validate type and size client-side
  - Show image preview with URL.createObjectURL(file)
  - Upload progress bar using XMLHttpRequest (from useCloudinaryUpload hook)
  - On success: store secure_url in form state as logo_url
  - On error: red toast "Upload failed. Try again."

On submit: call api.adminCreateStore or api.adminUpdateStore, success toast, redirect to /admin/stores

### components/admin/CouponForm.tsx
Full form for creating/editing a coupon. React Hook Form + Zod.

Fields:
- Store (searchable select — type to filter stores, show logo + name in options)
- Title (required text)
- Description (textarea)
- Coupon Type (radio: Code / Deal / Cashback)
- Code (text — only shown when type = 'code', with "Generate random code" button)
- Discount Value (text, e.g. "30%" or "₹200 off")
- Affiliate URL (URL, required)
- Expires At (date input, optional)
- Is Verified (toggle)
- Is Featured (toggle)
- Is Exclusive (toggle)

On submit: POST or PATCH admin coupon endpoints, success toast, redirect to /admin/coupons

### components/admin/CouponTable.tsx
Full data table:
Columns: Store Logo+Name, Title (truncated 50 chars), Type Badge, Code (masked), Expires, Verified checkmark, Featured star, Actions
Actions per row: Edit button (navigates to /admin/coupons/:id/edit), Delete button (shows confirm dialog)
Header row: sticky, sortable columns (click to sort asc/desc)
Filter bar above table: text search input + type select filter
Pagination at bottom using Pagination component

---

## PAGE SPECIFICATIONS — implement every page fully

### app/layout.tsx
- Import Inter from next/font/google, apply to html element
- Wraps all pages in Providers.tsx
- Renders Header, children, Footer, MobileNav (mobile only)
- Sonner Toaster component at root level
- Vercel Analytics component

### app/page.tsx — Homepage
Server Component. Parallel fetch with Promise.all:
- api.getCategories()
- api.getStores({ featured: true, limit: 12 })
- api.getCoupons({ featured: true, limit: 12 })

Page sections in order:
1. HeroBanner (client component, receives featured coupons)
2. CategoryGrid — "Shop by Category" heading, 8 categories
3. "Top Stores" section — heading + "View All Stores →" link to /stores, StoreGrid 12 stores (3 cols mobile, 4 cols tablet, 6 cols desktop)
4. "Today's Best Deals" section — heading + "View All →" link to /coupons, CouponGrid 12 coupons (1 col mobile, 2 col tablet, 3 col desktop)
5. NewsletterBanner — "Get the best deals in your inbox" heading, email input + "Subscribe" button, calls api.subscribeAlert({ email })

generateMetadata: title "Best Coupons & Deals in India | Save More Today", description 150 chars, full OG tags

### app/stores/page.tsx — All Stores
Server Component. Fetches api.getStores({ page, limit: 24 }) based on searchParams.
- Page heading "All Stores"
- Category filter tabs (fetched from api.getCategories()) — clicking filters stores by category
- StoreGrid with all stores
- Pagination

generateMetadata: "All Stores — Coupons & Cashback Offers | SiteName"

### app/stores/[slug]/page.tsx — Store Page
Server Component. Parallel fetch:
- api.getStore(slug)
- api.getCoupons({ store: slug, limit: 20 })

Layout:
- StoreHeader component
- CouponFilters below header (client component for filtering)
- CouponList with all store coupons
- Pagination if total > 20

generateStaticParams: fetch top 50 stores and return their slugs
revalidate: 3600 (ISR hourly)
generateMetadata: "{StoreName} Coupons & Promo Codes {year} — Up to {cashback_rate} Off"

### app/categories/[slug]/page.tsx — Category Page
Server Component. Fetch stores and coupons filtered by category slug.
- Heading: "{Category Name} Coupons & Deals"
- Featured stores in this category (StoreGrid, limit 8)
- All coupons in this category (CouponGrid with filters)

### app/coupons/[id]/page.tsx — Single Coupon Page
Server Component. Fetches api.getCoupon(id).
- Coupon detail card (large): full title, full description, store info, discount value, expiry
- "Reveal Code" / "Get Deal" CTA button — triggers CouponModal on client
- "More from {StoreName}" section: 6 coupons from same store
- Breadcrumb: Home > Stores > {StoreName} > {Coupon Title}

revalidate: 1800
generateMetadata: "{CouponTitle} — {StoreName} Promo Code | SiteName"

### app/search/page.tsx — Search Results
Client Component. Reads ?q= from useSearchParams().
- Search bar pre-filled with current query
- Calls useSearch(q) via TanStack Query
- Two sections: "Stores ({n})" and "Coupons ({n})"
- Stores section: StoreGrid
- Coupons section: CouponGrid with filters
- If no results: EmptyState icon=Search, title="No results for '{q}'", description="Try different keywords or browse categories", actionLabel="Browse Categories", onAction=navigate to /categories
- Loading: skeleton grids
- robots: noindex (set in generateMetadata)

### app/account/page.tsx — Profile
AuthGuard protected. Shows ProfileForm. Fetches api.getMe(). On submit: PATCH /api/me.

### app/account/saved/page.tsx — Saved Coupons
AuthGuard protected. Fetches api.getSavedCoupons(). Renders CouponList with saved coupons.
Empty state: EmptyState with Bookmark icon, "No saved coupons yet", "Browse Deals" action.

### app/account/alerts/page.tsx — Deal Alerts
AuthGuard protected. Fetches api.getAlerts(). Renders AlertsList.
Each alert row: store/category name + email + toggle active/inactive + delete button.
"Add Alert" button opens a form modal.

### app/admin/page.tsx — Admin Dashboard
Admin role protected. Renders StatsCards + recent CouponTable (limit 10).

### app/admin/coupons/page.tsx
Admin protected. Full CouponTable with pagination, search, filter.

### app/admin/coupons/new/page.tsx
Admin protected. Renders CouponForm for creating new coupon.

### app/admin/coupons/[id]/edit/page.tsx
Admin protected. Fetches coupon, renders CouponForm pre-filled for editing.

### app/admin/stores/page.tsx
Admin protected. Full StoreTable.

### app/admin/stores/new/page.tsx
Admin protected. Renders StoreForm for creating new store.

### app/(auth)/login/page.tsx
Shows LoginForm + OAuthButtons. Redirect to / if already logged in (check session in server component).

### app/(auth)/signup/page.tsx
Shows SignupForm (name + email + password + confirm password). On success redirect to /.

### app/(auth)/callback/route.ts
GET handler. Exchange Supabase OAuth code for session via supabase.auth.exchangeCodeForSession(code). Redirect to /.

---

## MIDDLEWARE (middleware.ts)

Use @supabase/ssr createServerClient. Implement:
1. Refresh Supabase session on every request (required by @supabase/ssr)
2. If request path starts with /account → check session. If none, redirect to /login?next={pathname}
3. If request path starts with /admin → check session AND user role from JWT app_metadata. If no session → redirect to /login. If session but role !== 'admin' → redirect to / with toast param ?error=unauthorized
4. All other paths: pass through

---

## NEXT.CONFIG.TS

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      }
    ]
  },
  experimental: {
    typedRoutes: true
  }
}
export default nextConfig
```

---

## SEO — implement for every page

Every page must export generateMetadata() or static metadata object:
- title: includes keywords + site name (use template in root layout: "%s | CouponIndia")
- description: max 150 chars, keyword-rich, unique per page
- openGraph: title, description, url, siteName, images: [{ url: '/og-image.png', width: 1200, height: 630 }]
- twitter: card: 'summary_large_image', title, description, image
- alternates: { canonical: full page URL }

Search page: robots: { index: false, follow: false }

---

## PERFORMANCE — implement all

- Homepage, store listing, category listing: ISR with revalidate: 3600
- Individual store pages: generateStaticParams (top 50 stores) + revalidate: 3600
- Individual coupon pages: revalidate: 1800
- Admin pages: dynamic (no caching), lazy loaded via next/dynamic
- All images: use Next.js Image component with explicit width and height. Above-fold images get priority={true}
- TanStack Query stale times as defined in queryClient.ts
- Never show blank white areas — all async content has Skeleton fallback
- Suspense boundaries around all async Server Components with Skeleton fallback

---

## RESPONSIVE DESIGN — all breakpoints

Mobile-first. All components must work across:
- Mobile (< 640px): single column, stacked layouts
- Tablet (640px–1024px): 2 column grids
- Desktop (> 1024px): 3–4 column grids

Header desktop: logo left, SearchBar center (max-w-lg), Login button + user avatar dropdown right
Header mobile: logo left, search icon button right + hamburger menu
MobileNav: fixed bottom bar with 4 icons — Home (Lucide Home), Categories (Lucide Grid), Search (Lucide Search), Account (Lucide User). Active tab highlighted in red.

---

## IMPLEMENTATION RULES

1. TypeScript strict mode — no `any` types anywhere
2. Every list page shows Skeleton while loading, EmptyState if no results
3. CouponCard must work correctly in both view='grid' and view='list'
4. CouponModal: focus trap, ESC closes, backdrop click closes, auto-close countdown
5. All forms: React Hook Form + Zod only — no uncontrolled inputs
6. Never use useEffect for data fetching — always TanStack Query
7. Auth token attached to every protected API call automatically via ApiClient
8. POST /api/coupons/:id/click must fire BEFORE opening affiliate URL in new tab
9. Toast notifications via Sonner: coupon copied ✓, saved ✓, alert subscribed ✓, errors ✗
10. SearchDropdown closes on route change (watch usePathname)
11. All dates formatted with Intl.DateTimeFormat or Intl.RelativeTimeFormat — no date-fns or moment
12. Cloudinary images use Next.js Image with hostname whitelisted in next.config.ts
13. Admin StoreForm image upload uses XMLHttpRequest for progress tracking (not fetch)
14. Never use HTML form elements — use div with onClick handlers for form submission triggers
15. All Zod schemas defined in a dedicated schemas/ folder, imported into forms
16. Generate complete README.md: setup steps, env vars, local dev, Vercel deploy

Build the complete working implementation of every single file listed. Do not skip any file. Do not write placeholder comments like "// implement later" or "// add logic here". Every component, hook, page, and utility must be fully implemented with real working code.
