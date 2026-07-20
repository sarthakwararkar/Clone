import { Hono } from 'hono';
import { z } from 'zod';
import { createDb } from '../db';
import { createCouponService } from '../services/couponService';
import { createCacheService } from '../services/cacheService';
import { optionalAuthMiddleware } from '../middleware/auth';
import type { AppBindings, CouponResponse, PaginatedResponse, ClickResponse, ApiResponse } from '../types';

const couponsRouter = new Hono<AppBindings>();

// ─── Query param schemas ────────────────────────────────────────────────────

const listCouponsSchema = z.object({
  store: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['code', 'deal', 'cashback']).optional(),
  featured: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  exclusive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  sort: z.enum(['featured', 'latest', 'popular', 'smart']).optional(),
  diverse: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v || '1', 10))),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v || '20', 10)))),
});

const reportSchema = z.object({
  worked: z.boolean(),
});

// ─── GET /api/coupons ───────────────────────────────────────────────────────

couponsRouter.get('/', async (c) => {
  const query = listCouponsSchema.parse(c.req.query());
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const cacheKey = `coupons:page:${query.page}:${query.limit}:${query.store || ''}:${query.category || ''}:${query.type || ''}:${query.featured ?? ''}:${query.exclusive ?? ''}:${query.sort || ''}:${query.diverse ?? ''}`;
  const cached = await cache.get<PaginatedResponse<CouponResponse>>(cacheKey);
  if (cached) {
    return c.json({ success: true, ...cached } as ApiResponse<CouponResponse[]>);
  }

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);

  const result = await couponService.listCoupons({
    storeSlug: query.store,
    categorySlug: query.category,
    type: query.type,
    featured: query.featured,
    exclusive: query.exclusive,
    sort: query.sort,
    diverse: query.diverse,
    pagination: { page: query.page, limit: query.limit },
  });

  await cache.set(cacheKey, result, 600); // 10 min cache

  return c.json({ success: true, ...result });
});

// ─── GET /api/coupons/:id ───────────────────────────────────────────────────

couponsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const cacheKey = `coupon:${id}`;
  const cached = await cache.get<CouponResponse>(cacheKey);
  if (cached) {
    return c.json({ success: true, data: cached } as ApiResponse<CouponResponse>);
  }

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);
  const coupon = await couponService.getCouponById(id);

  if (!coupon) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  await cache.set(cacheKey, coupon, 600); // 10 min cache

  return c.json({ success: true, data: coupon });
});

// ─── POST /api/coupons/:id/click ────────────────────────────────────────────

couponsRouter.post('/:id/click', optionalAuthMiddleware, async (c) => {
  const couponId = c.req.param('id');
  const user = c.get('user');

  // Hash the IP for anonymous tracking
  const clientIp =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const ipHashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(clientIp)
  );
  const ipHash = Array.from(new Uint8Array(ipHashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);

  let redirectUrl = await couponService.recordClick(
    couponId,
    user?.id ?? null,
    ipHash
  );

  if (!redirectUrl) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  // ─── CueLinks Deep-Link Conversion ──────────────────────────────────
  // If the URL isn't already a CueLinks tracked link, convert it
  if (
    c.env.CUELINKS_API_KEY &&
    redirectUrl.startsWith('https://') &&
    !redirectUrl.includes('cuelinks.com') &&
    !redirectUrl.includes('clnk.in')
  ) {
    const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);
    const cacheKey = `cuelink:${redirectUrl}`;
    const cached = await cache.get<string>(cacheKey);

    if (cached) {
      redirectUrl = cached;
    } else {
      const { createAffiliateService } = await import('../services/affiliateService');
      const affiliateService = createAffiliateService(db);
      const converted = await affiliateService.convertToCuelinkUrl(
        c.env.CUELINKS_API_KEY,
        redirectUrl
      );
      if (converted !== redirectUrl) {
        await cache.set(cacheKey, converted, 86400); // Cache for 24 hours
        redirectUrl = converted;
      }
    }
  }

  return c.json({
    success: true,
    data: { redirect_url: redirectUrl },
  } as ApiResponse<ClickResponse>);
});

// ─── POST /api/coupons/:id/report ───────────────────────────────────────────

couponsRouter.post('/:id/report', optionalAuthMiddleware, async (c) => {
  const couponId = c.req.param('id');
  const user = c.get('user');

  const body = await c.req.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);

  const success = await couponService.recordReport(
    couponId,
    user?.id ?? null,
    parsed.data.worked
  );

  if (!success) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  return c.json({
    success: true,
    message: 'Report submitted successfully',
  } as ApiResponse);
});

export { couponsRouter };
