# CouponDunia Clone — Frontend

A pixel-perfect, feature-rich, and high-performance frontend for CouponDunia — India's leading coupon & cashback aggregator platform. Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, and **TanStack Query v5**.

## Features

- **Store Categories**: Browse deals categorized across Fashion, Electronics, Travel, Food, and more.
- **Merchant Store Hub**: Store headers with coupon counts, active offers, website links, and brand cashback rates.
- **Dual-View Coupon Cards**: Supports grid and list views with verified status badges, exclusive badges, saved indicators, and relative expiry timers.
- **Interactive Reveal Modal**: Direct click-through analytics logging, clipboard copy, rating ("Worked"/"Didn't Work"), and automatic 60-second auto-close.
- **Search Engine**: Debounced search bar with a keyboard-navigable autocomplete dropdown.
- **Zustand Filter Store**: Instant client-side coupon category filtering and sorting (Featured, Newest, Most Used).
- **User Dashboard**: Secure auth-guarded profile edits, saved coupons management, and custom deal alert subscriptions.
- **Admin Command Center**: Complete secure dashboard listing total metrics, interactive paginated data tables for stores/coupons, searchable forms, and direct drag-and-drop Cloudinary logo uploads with live progress bar.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5 (React Query)
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Forms**: React Hook Form + Zod validation
- **Image Uploads**: Direct Cloudinary uploads using `XMLHttpRequest` (with progress tracker)
- **SEO**: Next.js Metadata API

---

## Environmental Setup

Create a `.env.local` file in the root of the `coupondunia-frontend/` directory with the following variables:

```env
# Backend API url
NEXT_PUBLIC_API_URL=https://coupondunia-backend.workers.dev

# Supabase Auth configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Local Site URL (for redirect callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary unsigned uploads (for store logos)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=coupondunia_unsigned
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Verification & Checks

### TypeScript Type Check
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

---

## Folder Structure

```
coupondunia-frontend/
├── app/                  # Next.js App Router (pages and layouts)
├── components/           # Reusable React UI Components
│   ├── account/          # Account forms and settings
│   ├── admin/            # Admin dashboard grids, forms and tables
│   ├── auth/             # LoginForm, SignupForm, OAuth buttons
│   ├── coupons/          # Coupon cards, filter bars and modals
│   ├── home/             # Carousels, newsletters, grids
│   ├── layout/           # Header, footer, navbars and providers
│   ├── search/           # Autocomplete lists and results grids
│   ├── stores/           # Store detail cards and badges
│   └── ui/               # Base visual primitives (Modals, Buttons)
├── hooks/                # Custom hooks (auth, saved, upload)
├── lib/                  # Fetch API clients and Supabase scripts
├── public/               # Static assets (logo.svg, og-image.png)
└── schemas/              # Zod verification forms schemas
```
