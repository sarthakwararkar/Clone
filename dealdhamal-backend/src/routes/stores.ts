import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { stores, coupons, categories } from '../db/schema';
import { createCacheService } from '../services/cacheService';
import type { AppBindings, StoreResponse, CouponResponse, ApiResponse, PaginatedResponse } from '../types';

const storesRouter = new Hono<AppBindings>();

// ─── Query param schemas ────────────────────────────────────────────────────

const listStoresSchema = z.object({
  category: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  sort: z.enum(['featured', 'most_deals']).optional(),
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v || '1', 10))),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v || '20', 10)))),
});

// ─── GET /api/stores ────────────────────────────────────────────────────────

storesRouter.get('/', async (c) => {
  const query = listStoresSchema.parse(c.req.query());
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const cacheKey = `stores:page:${query.page}:${query.limit}:${query.category || ''}:${query.featured ?? ''}:${query.sort || ''}`;
  const cached = await cache.get<PaginatedResponse<StoreResponse>>(cacheKey);
  if (cached) {
    return c.json({ success: true, ...cached });
  }

  const db = createDb(c.env.DATABASE_URL);
  const offset = (query.page - 1) * query.limit;

  // Build query
  let dataQuery = sql`
    SELECT
      s.id, s.name, s.slug, s.logo_url, s.banner_url, s.website_url, s.affiliate_url,
      s.affiliate_network, s.description, s.category_id, s.is_featured,
      s.cashback_rate, s.created_at,
      (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NOT NULL AND TRIM(c.code) != '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS coupon_count,
      (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NULL OR TRIM(c.code) = '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS deal_count
    FROM stores s
  `;

  let countQuery = sql`SELECT COUNT(*)::int AS total FROM stores s`;

  const whereParts: ReturnType<typeof sql>[] = [];

  if (query.category) {
    dataQuery = sql`
      SELECT
        s.id, s.name, s.slug, s.logo_url, s.banner_url, s.website_url, s.affiliate_url,
        s.affiliate_network, s.description, s.category_id, s.is_featured,
        s.cashback_rate, s.created_at,
        (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NOT NULL AND TRIM(c.code) != '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS coupon_count,
        (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NULL OR TRIM(c.code) = '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS deal_count
      FROM stores s
      JOIN categories cat ON cat.id = s.category_id
    `;
    countQuery = sql`SELECT COUNT(*)::int AS total FROM stores s JOIN categories cat ON cat.id = s.category_id`;
    whereParts.push(sql`cat.slug = ${query.category}`);
  }

  if (query.featured !== undefined) {
    whereParts.push(sql`s.is_featured = ${query.featured}`);
  }

  // Dynamic sort / order by
  let orderByClause = sql`s.is_featured DESC, s.name ASC`;
  if (query.sort === 'most_deals') {
    orderByClause = sql`((SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.expires_at > NOW() OR c.expires_at IS NULL)))::int DESC, s.is_featured DESC, s.name ASC`;
  }

  let finalDataQuery;
  let finalCountQuery;

  if (whereParts.length > 0) {
    const whereClause = sql.join(whereParts, sql` AND `);
    finalDataQuery = sql`${dataQuery} WHERE ${whereClause} ORDER BY ${orderByClause} LIMIT ${query.limit} OFFSET ${offset}`;
    finalCountQuery = sql`${countQuery} WHERE ${whereClause}`;
  } else {
    finalDataQuery = sql`${dataQuery} ORDER BY ${orderByClause} LIMIT ${query.limit} OFFSET ${offset}`;
    finalCountQuery = countQuery;
  }

  const [dataResult, countResult] = await Promise.all([
    db.execute(finalDataQuery),
    db.execute(finalCountQuery),
  ]);

  const total = (countResult.rows[0] as Record<string, unknown>)?.total as number || 0;
  const totalPages = Math.ceil(total / query.limit);

  const data: StoreResponse[] = (dataResult.rows as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    logo_url: row.logo_url as string | null,
    banner_url: row.banner_url as string | null,
    website_url: row.website_url as string | null,
    affiliate_url: row.affiliate_url as string | null,
    affiliate_network: row.affiliate_network as string | null,
    description: row.description as string | null,
    category_id: row.category_id as number | null,
    is_featured: row.is_featured as boolean,
    cashback_rate: row.cashback_rate as string | null,
    created_at: new Date(row.created_at as string).toISOString(),
    coupon_count: row.coupon_count as number,
    deal_count: row.deal_count as number,
  }));

  const result: PaginatedResponse<StoreResponse> = {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
  };

  await cache.set(cacheKey, result, 1800); // 30 min cache

  return c.json({ success: true, ...result });
});

// ─── GET /api/stores/:slug ──────────────────────────────────────────────────

storesRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const cacheKey = `store:${slug}`;
  const cached = await cache.get<{ store: StoreResponse; coupons: CouponResponse[] }>(cacheKey);
  if (cached) {
    return c.json({ success: true, data: cached });
  }

  const db = createDb(c.env.DATABASE_URL);

  // Get store details
  const storeResult = await db.execute(sql`
    SELECT
      s.id, s.name, s.slug, s.logo_url, s.banner_url, s.website_url, s.affiliate_url,
      s.affiliate_network, s.description, s.category_id, s.is_featured,
      s.cashback_rate, s.created_at,
      (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NOT NULL AND TRIM(c.code) != '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS coupon_count,
      (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND (c.code IS NULL OR TRIM(c.code) = '') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS deal_count
    FROM stores s
    WHERE s.slug = ${slug}
    LIMIT 1
  `);

  if (!storeResult.rows.length) {
    return c.json({ success: false, error: 'Store not found' } as ApiResponse, 404);
  }

  const storeRow = storeResult.rows[0] as Record<string, unknown>;
  const store: StoreResponse = {
    id: storeRow.id as string,
    name: storeRow.name as string,
    slug: storeRow.slug as string,
    logo_url: storeRow.logo_url as string | null,
    banner_url: storeRow.banner_url as string | null,
    website_url: storeRow.website_url as string | null,
    affiliate_url: storeRow.affiliate_url as string | null,
    affiliate_network: storeRow.affiliate_network as string | null,
    description: storeRow.description as string | null,
    category_id: storeRow.category_id as number | null,
    is_featured: storeRow.is_featured as boolean,
    cashback_rate: storeRow.cashback_rate as string | null,
    created_at: new Date(storeRow.created_at as string).toISOString(),
    coupon_count: storeRow.coupon_count as number,
    deal_count: storeRow.deal_count as number,
  };

  // Get top 10 active coupons for this store
  const couponsResult = await db.execute(sql`
    SELECT
      id, store_id, title, description, code, coupon_type,
      discount_value, affiliate_url, source, is_verified, is_exclusive,
      is_featured, expires_at, starts_at, success_rate, used_count, created_at
    FROM coupons
    WHERE store_id = ${store.id}
      AND (expires_at > NOW() OR expires_at IS NULL)
    ORDER BY is_featured DESC, used_count DESC
    LIMIT 10
  `);

  const storeCoupons: CouponResponse[] = (couponsResult.rows as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    store_id: row.store_id as string,
    title: row.title as string,
    description: row.description as string | null,
    code: row.code as string | null,
    coupon_type: row.coupon_type as CouponResponse['coupon_type'],
    discount_value: row.discount_value as string,
    affiliate_url: row.affiliate_url as string,
    source: row.source as string | null,
    is_verified: row.is_verified as boolean,
    is_exclusive: row.is_exclusive as boolean,
    is_featured: row.is_featured as boolean,
    expires_at: row.expires_at ? new Date(row.expires_at as string).toISOString() : null,
    starts_at: row.starts_at ? new Date(row.starts_at as string).toISOString() : null,
    success_rate: row.success_rate as number,
    used_count: row.used_count as number,
    created_at: new Date(row.created_at as string).toISOString(),
  }));

  const responseData = { store, coupons: storeCoupons };
  await cache.set(cacheKey, responseData, 900); // 15 min cache

  return c.json({ success: true, data: responseData });
});

export { storesRouter };
