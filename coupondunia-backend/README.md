# CouponDunia Backend

A production-ready coupon & cashback aggregator backend for India, built with Hono on Cloudflare Workers.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Cloudflare Workers |
| **Framework** | [Hono](https://hono.dev/) (TypeScript) |
| **Database** | [Neon](https://neon.tech/) (PostgreSQL) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Cache** | [Upstash Redis](https://upstash.com/) |
| **Auth** | [Supabase Auth](https://supabase.com/) (JWT verification) |
| **Storage** | [Cloudinary](https://cloudinary.com/) |
| **Email** | [Resend](https://resend.com/) |
| **Search** | PostgreSQL Full-Text Search |
| **Cron Jobs** | GitHub Actions |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd coupondunia-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

- **Neon**: Create a project at [neon.tech](https://neon.tech) → copy the connection string
- **Supabase**: Create a project at [supabase.com](https://supabase.com) → copy the JWT secret from Settings → API
- **Upstash**: Create a Redis database at [upstash.com](https://upstash.com) → copy URL and token
- **Resend**: Sign up at [resend.com](https://resend.com) → create an API key
- **Sentry**: Create a project at [sentry.io](https://sentry.io) → copy the DSN

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Apply FTS Triggers

Run the FTS trigger migration manually against your Neon database:

```bash
# Using psql
psql $DATABASE_URL -f src/db/migrations/0000_fts_triggers.sql

# Or paste the SQL into Neon's SQL Editor in the dashboard
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8787`.

### 6. Test the API

```bash
# Health check
curl http://localhost:8787/api/health

# List categories
curl http://localhost:8787/api/categories

# Search
curl "http://localhost:8787/api/search?q=amazon"
```

## 📁 Project Structure

```
coupondunia-backend/
├── src/
│   ├── index.ts                  # Hono app entry, Workers export
│   ├── env.ts                    # Zod-validated env vars
│   ├── db/
│   │   ├── schema.ts             # Drizzle ORM table definitions
│   │   ├── index.ts              # Neon DB connection
│   │   └── migrations/           # SQL migrations
│   ├── middleware/
│   │   ├── auth.ts               # Supabase JWT verification
│   │   ├── rateLimit.ts          # Upstash Redis rate limiting
│   │   └── sentry.ts             # Sentry error capture
│   ├── routes/
│   │   ├── coupons.ts            # Coupon CRUD + search
│   │   ├── stores.ts             # Store listings
│   │   ├── categories.ts         # Categories
│   │   ├── users.ts              # User profile, saved coupons
│   │   ├── alerts.ts             # Deal alert subscriptions
│   │   └── admin.ts              # Admin routes (protected)
│   ├── services/
│   │   ├── couponService.ts      # Coupon business logic
│   │   ├── searchService.ts      # Postgres FTS
│   │   ├── cacheService.ts       # Upstash Redis cache
│   │   ├── emailService.ts       # Resend email sender
│   │   ├── cloudinaryService.ts    # Cloudinary image storage
│   │   └── affiliateService.ts   # Affiliate API sync
│   ├── jobs/
│   │   ├── syncCoupons.ts        # Cron: sync affiliate feeds
│   │   └── expireCoupons.ts      # Cron: expire old coupons
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── .github/workflows/
│   ├── sync-coupons.yml          # Every 6 hours
│   └── expire-coupons.yml        # Daily at midnight
├── drizzle.config.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
```

## 🔌 API Routes

### Public Routes (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/stores` | List stores (paginated, filterable) |
| `GET` | `/api/stores/:slug` | Store details + top coupons |
| `GET` | `/api/coupons` | List coupons (paginated, filterable) |
| `GET` | `/api/coupons/:id` | Single coupon details |
| `GET` | `/api/search?q=:query` | Full-text search |
| `POST` | `/api/coupons/:id/click` | Track click, get redirect URL |
| `POST` | `/api/coupons/:id/report` | Report if coupon worked |

### Protected Routes (require JWT)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Current user profile |
| `PATCH` | `/api/me` | Update profile |
| `GET` | `/api/me/saved` | Saved coupons |
| `POST` | `/api/me/saved/:couponId` | Save a coupon |
| `DELETE` | `/api/me/saved/:couponId` | Unsave a coupon |
| `POST` | `/api/alerts` | Create deal alert |
| `GET` | `/api/alerts` | List alerts |
| `DELETE` | `/api/alerts/:id` | Deactivate alert |

### Admin Routes (require admin role)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/coupons` | Create coupon |
| `PATCH` | `/api/admin/coupons/:id` | Update coupon |
| `DELETE` | `/api/admin/coupons/:id` | Soft delete coupon |
| `POST` | `/api/admin/stores` | Create store (with logo upload) |
| `PATCH` | `/api/admin/stores/:id` | Update store |
| `POST` | `/api/admin/sync` | Trigger affiliate sync |

## 🚢 Deployment

### Deploy to Cloudflare Workers

```bash
# Set secrets
wrangler secret put DATABASE_URL
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_JWT_SECRET
wrangler secret put UPSTASH_REDIS_URL
wrangler secret put UPSTASH_REDIS_TOKEN
wrangler secret put RESEND_API_KEY
wrangler secret put SENTRY_DSN
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET

# Deploy
npm run deploy
```

### Configure GitHub Actions

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `DATABASE_URL`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`
- `VCOMMISSION_API_KEY`
- `ADMITAD_CLIENT_ID`
- `ADMITAD_CLIENT_SECRET`
- `CJ_API_KEY`

## 📝 Available Scripts

```bash
npm run dev          # Start local dev server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
npm run typecheck    # TypeScript type checking
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run jobs:sync    # Run coupon sync job locally
npm run jobs:expire  # Run expire coupons job locally
```

## 🔒 Rate Limiting

- **Public routes**: 100 requests/minute per IP
- **Authenticated routes**: 30 requests/minute per user

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## 📊 Caching Strategy

| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| Categories | `categories:all` | 1 hour |
| Store list | `stores:page:{page}:{category}` | 30 min |
| Store detail | `store:{slug}` | 15 min |
| Coupon list | `coupons:page:{page}:...` | 10 min |
| Coupon detail | `coupon:{id}` | 10 min |
| Search | `search:{query}` | 5 min |

All caches are invalidated on admin mutations (create/update/delete).

## 📄 License

MIT
