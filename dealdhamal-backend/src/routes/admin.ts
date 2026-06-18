import { Hono } from 'hono';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { coupons, stores } from '../db/schema';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { createCouponService } from '../services/couponService';
import { createCacheService } from '../services/cacheService';
import { createCloudinaryService } from '../services/cloudinaryService';
import { createAffiliateService } from '../services/affiliateService';
import type { AppBindings, ApiResponse, CouponResponse, StoreResponse } from '../types';

const adminRouter = new Hono<AppBindings>();

// Apply auth + admin middleware to all admin routes
adminRouter.use('*', authMiddleware);
adminRouter.use('*', adminMiddleware);

// ─── Validation schemas ─────────────────────────────────────────────────────

const createCouponSchema = z.object({
  store_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  code: z.string().max(100).optional(),
  coupon_type: z.enum(['code', 'deal', 'cashback']),
  discount_value: z.string().min(1),
  affiliate_url: z.string().url(),
  source: z.enum(['vcommission', 'admitad', 'cj', 'manual']).optional(),
  external_id: z.string().optional(),
  is_verified: z.boolean().optional(),
  is_exclusive: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
});

const updateCouponSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  code: z.string().max(100).optional(),
  coupon_type: z.enum(['code', 'deal', 'cashback']).optional(),
  discount_value: z.string().optional(),
  affiliate_url: z.string().url().optional(),
  is_verified: z.boolean().optional(),
  is_exclusive: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
});

const createStoreSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  logo_url: z.string().url().or(z.literal('')).optional(),
  banner_url: z.string().url().or(z.literal('')).optional(),
  website_url: z.string().url().or(z.literal('')).optional(),
  affiliate_url: z.string().url().or(z.literal('')).optional(),
  affiliate_network: z.string().optional(),
  description: z.string().max(2000).optional(),
  category_id: z.number().int().positive().optional(),
  is_featured: z.boolean().optional(),
  cashback_rate: z.string().optional(),
});

const updateStoreSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  logo_url: z.string().url().or(z.literal('')).optional(),
  banner_url: z.string().url().or(z.literal('')).optional(),
  website_url: z.string().url().or(z.literal('')).optional(),
  affiliate_url: z.string().url().or(z.literal('')).optional(),
  affiliate_network: z.string().optional(),
  description: z.string().max(2000).optional(),
  category_id: z.number().int().positive().optional(),
  is_featured: z.boolean().optional(),
  cashback_rate: z.string().optional(),
});

// ─── POST /api/admin/coupons ────────────────────────────────────────────────

adminRouter.post('/coupons', async (c) => {
  const body = await c.req.json();
  const parsed = createCouponSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const coupon = await couponService.createCoupon(parsed.data);

  // Invalidate relevant caches
  await Promise.all([
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('search:'),
  ]);

  return c.json({ success: true, data: coupon } as ApiResponse<CouponResponse>, 201);
});

// ─── PATCH /api/admin/coupons/:id ───────────────────────────────────────────

adminRouter.patch('/coupons/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateCouponSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const coupon = await couponService.updateCoupon(id, parsed.data);

  if (!coupon) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  // Invalidate relevant caches
  await Promise.all([
    cache.del(`coupon:${id}`),
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('search:'),
  ]);

  return c.json({ success: true, data: coupon });
});

// ─── DELETE /api/admin/coupons/:id ──────────────────────────────────────────

adminRouter.delete('/coupons/:id', async (c) => {
  const id = c.req.param('id');
  const db = createDb(c.env.DATABASE_URL);
  const couponService = createCouponService(db);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const deleted = await couponService.softDeleteCoupon(id);

  if (!deleted) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  // Invalidate relevant caches
  await Promise.all([
    cache.del(`coupon:${id}`),
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('search:'),
  ]);

  return c.json({ success: true, message: 'Coupon soft deleted (expired)' } as ApiResponse);
});

// ─── POST /api/admin/stores ─────────────────────────────────────────────────

adminRouter.post('/stores', async (c) => {
  const contentType = c.req.header('content-type') || '';
  const db = createDb(c.env.DATABASE_URL);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  let storeData: z.infer<typeof createStoreSchema>;
  let logoUrl: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData();

    // Parse store fields from form data
    const rawData: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'logo') continue;
      if (key === 'category_id') {
        rawData[key] = parseInt(value as string, 10);
      } else if (key === 'is_featured') {
        rawData[key] = value === 'true';
      } else {
        rawData[key] = value;
      }
    }

    const parsed = createStoreSchema.safeParse(rawData);
    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
        400
      );
    }
    storeData = parsed.data;

    // Handle logo upload
    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      const cloudinaryService = createCloudinaryService(
        c.env.CLOUDINARY_CLOUD_NAME,
        c.env.CLOUDINARY_API_KEY,
        c.env.CLOUDINARY_API_SECRET
      );
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `stores/logos/${storeData.slug}.${ext}`;
      const arrayBuffer = await logoFile.arrayBuffer();
      logoUrl = await cloudinaryService.uploadFile(key, arrayBuffer, logoFile.type);
    }
  } else {
    const body = await c.req.json();
    const parsed = createStoreSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
        400
      );
    }
    storeData = parsed.data;
  }

  // Create store
  const [store] = await db
    .insert(stores)
    .values({
      name: storeData.name,
      slug: storeData.slug,
      logo_url: logoUrl || storeData.logo_url || null,
      banner_url: storeData.banner_url || null,
      website_url: storeData.website_url ?? null,
      affiliate_url: storeData.affiliate_url ?? null,
      affiliate_network: storeData.affiliate_network ?? null,
      description: storeData.description ?? null,
      category_id: storeData.category_id ?? null,
      is_featured: storeData.is_featured ?? false,
      cashback_rate: storeData.cashback_rate ?? null,
    })
    .returning();

  // Invalidate caches
  await Promise.all([
    cache.delPattern('stores:'),
    cache.delPattern('categories:'),
  ]);

  const response: StoreResponse = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo_url: store.logo_url,
    banner_url: store.banner_url,
    website_url: store.website_url,
    affiliate_url: store.affiliate_url,
    affiliate_network: store.affiliate_network,
    description: store.description,
    category_id: store.category_id,
    is_featured: store.is_featured,
    cashback_rate: store.cashback_rate,
    created_at: store.created_at.toISOString(),
    coupon_count: 0,
  };

  return c.json({ success: true, data: response } as ApiResponse<StoreResponse>, 201);
});

// ─── PATCH /api/admin/stores/:id ────────────────────────────────────────────

adminRouter.patch('/stores/:id', async (c) => {
  const id = c.req.param('id');
  const contentType = c.req.header('content-type') || '';
  const db = createDb(c.env.DATABASE_URL);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  let updateData: z.infer<typeof updateStoreSchema>;
  let newLogoUrl: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData();

    const rawData: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'logo') continue;
      if (key === 'category_id') {
        rawData[key] = parseInt(value as string, 10);
      } else if (key === 'is_featured') {
        rawData[key] = value === 'true';
      } else {
        rawData[key] = value;
      }
    }

    const parsed = updateStoreSchema.safeParse(rawData);
    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
        400
      );
    }
    updateData = parsed.data;

    // Handle new logo upload
    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      const cloudinaryService = createCloudinaryService(
        c.env.CLOUDINARY_CLOUD_NAME,
        c.env.CLOUDINARY_API_KEY,
        c.env.CLOUDINARY_API_SECRET
      );

      // Delete old logo if exists
      const [existingStore] = await db
        .select({ logo_url: stores.logo_url, slug: stores.slug })
        .from(stores)
        .where(eq(stores.id, id))
        .limit(1);

      if (existingStore?.logo_url) {
        const oldKey = cloudinaryService.getKeyFromUrl(existingStore.logo_url);
        if (oldKey) {
          await cloudinaryService.deleteFile(oldKey);
        }
      }

      const slug = updateData.slug || existingStore?.slug || id;
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `stores/logos/${slug}.${ext}`;
      const arrayBuffer = await logoFile.arrayBuffer();
      newLogoUrl = await cloudinaryService.uploadFile(key, arrayBuffer, logoFile.type);
    }
  } else {
    const body = await c.req.json();
    const parsed = updateStoreSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
        400
      );
    }
    updateData = parsed.data;
  }

  // Build update object
  const setData: Record<string, unknown> = { updated_at: new Date() };
  if (updateData.name !== undefined) setData.name = updateData.name;
  if (updateData.slug !== undefined) setData.slug = updateData.slug;
  if (updateData.logo_url !== undefined) setData.logo_url = updateData.logo_url || null;
  if (updateData.banner_url !== undefined) setData.banner_url = updateData.banner_url || null;
  if (updateData.website_url !== undefined) setData.website_url = updateData.website_url || null;
  if (updateData.affiliate_url !== undefined) setData.affiliate_url = updateData.affiliate_url || null;
  if (updateData.affiliate_network !== undefined) setData.affiliate_network = updateData.affiliate_network;
  if (updateData.description !== undefined) setData.description = updateData.description;
  if (updateData.category_id !== undefined) setData.category_id = updateData.category_id;
  if (updateData.is_featured !== undefined) setData.is_featured = updateData.is_featured;
  if (updateData.cashback_rate !== undefined) setData.cashback_rate = updateData.cashback_rate;
  if (newLogoUrl) setData.logo_url = newLogoUrl;

  const [updated] = await db
    .update(stores)
    .set(setData)
    .where(eq(stores.id, id))
    .returning();

  if (!updated) {
    return c.json({ success: false, error: 'Store not found' } as ApiResponse, 404);
  }

  // Invalidate caches
  await Promise.all([
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('search:'),
    cache.delPattern('categories:'),
  ]);

  const response: StoreResponse = {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    logo_url: updated.logo_url,
    banner_url: updated.banner_url,
    website_url: updated.website_url,
    affiliate_url: updated.affiliate_url,
    affiliate_network: updated.affiliate_network,
    description: updated.description,
    category_id: updated.category_id,
    is_featured: updated.is_featured,
    cashback_rate: updated.cashback_rate,
    created_at: updated.created_at.toISOString(),
  };

  return c.json({ success: true, data: response });
});

// ─── POST /api/admin/sync ───────────────────────────────────────────────────

adminRouter.post('/sync', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const affiliateService = createAffiliateService(db);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const results = {
    vcommission: { coupons: 0, error: null as string | null },
    admitad: { coupons: 0, error: null as string | null },
    cj: { coupons: 0, error: null as string | null },
    upsert: { inserted: 0, updated: 0 },
  };

  const allCoupons = [];

  // Sync from all sources (parallel)
  const [vcCoupons, admitadCoupons, cjCoupons] = await Promise.allSettled([
    affiliateService.syncVCommission(c.env.VCOMMISSION_API_KEY || ''),
    affiliateService.syncAdmitad(
      c.env.ADMITAD_CLIENT_ID || '',
      c.env.ADMITAD_CLIENT_SECRET || ''
    ),
    affiliateService.syncCJAffiliate(c.env.CJ_API_KEY || ''),
  ]);

  if (vcCoupons.status === 'fulfilled') {
    results.vcommission.coupons = vcCoupons.value.length;
    allCoupons.push(...vcCoupons.value);
  } else {
    results.vcommission.error = vcCoupons.reason?.message || 'Unknown error';
  }

  if (admitadCoupons.status === 'fulfilled') {
    results.admitad.coupons = admitadCoupons.value.length;
    allCoupons.push(...admitadCoupons.value);
  } else {
    results.admitad.error = admitadCoupons.reason?.message || 'Unknown error';
  }

  if (cjCoupons.status === 'fulfilled') {
    results.cj.coupons = cjCoupons.value.length;
    allCoupons.push(...cjCoupons.value);
  } else {
    results.cj.error = cjCoupons.reason?.message || 'Unknown error';
  }

  // Upsert all coupons
  if (allCoupons.length > 0) {
    results.upsert = await affiliateService.upsertCoupons(allCoupons);
  }

  // Invalidate all caches
  await Promise.all([
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('coupon:'),
    cache.delPattern('search:'),
  ]);

  return c.json({ success: true, data: results });
});

// ─── GET /api/admin/stats ───────────────────────────────────────────────────

adminRouter.get('/stats', async (c) => {
  const db = createDb(c.env.DATABASE_URL);

  const [couponsCount, storesCount, usersCount, expiringCount] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS total FROM coupons`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM stores`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM users`),
    db.execute(sql`
      SELECT COUNT(*)::int AS total 
      FROM coupons 
      WHERE expires_at > NOW() AND expires_at <= NOW() + INTERVAL '7 days'
    `)
  ]);

  const totalCoupons = (couponsCount.rows[0] as any)?.total || 0;
  const totalStores = (storesCount.rows[0] as any)?.total || 0;
  const totalUsers = (usersCount.rows[0] as any)?.total || 0;
  const expiringThisWeek = (expiringCount.rows[0] as any)?.total || 0;

  return c.json({
    success: true,
    data: {
      totalCoupons,
      totalStores,
      totalUsers,
      expiringThisWeek,
    }
  });
});

// ─── GET /api/admin/coupons ─────────────────────────────────────────────────

const listAdminCouponsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v || '1', 10))),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v || '20', 10)))),
});

adminRouter.get('/coupons', async (c) => {
  const query = listAdminCouponsSchema.parse(c.req.query());
  const db = createDb(c.env.DATABASE_URL);
  const offset = (query.page - 1) * query.limit;

  const dataQuery = sql`
    SELECT
      c.id, c.store_id, c.title, c.description, c.code, c.coupon_type,
      c.discount_value, c.affiliate_url, c.source, c.is_verified, c.is_exclusive,
      c.is_featured, c.expires_at, c.starts_at, c.success_rate, c.used_count, c.created_at,
      s.name AS store_name, s.logo_url AS store_logo_url, s.slug AS store_slug
    FROM coupons c
    LEFT JOIN stores s ON s.id = c.store_id
    ORDER BY c.created_at DESC
    LIMIT ${query.limit} OFFSET ${offset}
  `;

  const countQuery = sql`SELECT COUNT(*)::int AS total FROM coupons`;

  const [dataResult, countResult] = await Promise.all([
    db.execute(dataQuery),
    db.execute(countQuery),
  ]);

  const total = (countResult.rows[0] as any)?.total || 0;
  const totalPages = Math.ceil(total / query.limit);

  const data = (dataResult.rows as any[]).map((row) => ({
    id: row.id,
    store_id: row.store_id,
    title: row.title,
    description: row.description,
    code: row.code,
    coupon_type: row.coupon_type,
    discount_value: row.discount_value,
    affiliate_url: row.affiliate_url,
    source: row.source,
    is_verified: row.is_verified,
    is_exclusive: row.is_exclusive,
    is_featured: row.is_featured,
    expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    starts_at: row.starts_at ? new Date(row.starts_at).toISOString() : null,
    success_rate: row.success_rate,
    used_count: row.used_count,
    created_at: new Date(row.created_at).toISOString(),
    store: {
      id: row.store_id,
      name: row.store_name,
      slug: row.store_slug,
      logo_url: row.store_logo_url,
    },
  }));

  return c.json({
    success: true,
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
  });
});

// ─── POST /api/admin/import ──────────────────────────────────────────────────

const importCouponItemSchema = z.object({
  store_slug: z.string().min(1),
  title: z.string().min(1).max(500),
  code: z.string().max(100).optional().nullable(),
  coupon_type: z.enum(['code', 'deal', 'cashback']),
  discount_value: z.string().min(1),
  affiliate_url: z.string().url(),
  expires_at: z.string().datetime().optional().nullable(),
  is_verified: z.boolean().optional(),
  is_exclusive: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

const importCouponsSchema = z.array(importCouponItemSchema);

adminRouter.post('/import', async (c) => {
  const body = await c.req.json();
  const parsed = importCouponsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body structure', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  // Fetch all stores to build slug-to-id mapping
  const allStores = await db.select({ id: stores.id, slug: stores.slug }).from(stores);
  const storeMap = new Map(allStores.map((s) => [s.slug, s.id]));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  const couponsToInsert = [];

  for (const item of parsed.data) {
    const storeId = storeMap.get(item.store_slug);
    if (!storeId) {
      skipped++;
      errors.push(`Store not found for slug: "${item.store_slug}" on coupon: "${item.title}"`);
      console.warn(`[Import] Skipping coupon "${item.title}": store slug "${item.store_slug}" not found`);
      continue;
    }

    couponsToInsert.push({
      store_id: storeId,
      title: item.title,
      code: item.code || null,
      coupon_type: item.coupon_type,
      discount_value: item.discount_value,
      affiliate_url: item.affiliate_url,
      source: 'manual',
      is_verified: item.is_verified ?? false,
      is_exclusive: item.is_exclusive ?? false,
      is_featured: item.is_featured ?? false,
      expires_at: item.expires_at ? new Date(item.expires_at) : null,
    });
  }

  if (couponsToInsert.length > 0) {
    try {
      // Insert in chunks of 50 to avoid database parameter size limit in Postgres
      const chunkSize = 50;
      for (let i = 0; i < couponsToInsert.length; i += chunkSize) {
        const chunk = couponsToInsert.slice(i, i + chunkSize);
        await db
          .insert(coupons)
          .values(chunk)
          .onConflictDoUpdate({
            target: [coupons.store_id, coupons.title],
            set: {
              code: sql`EXCLUDED.code`,
              coupon_type: sql`EXCLUDED.coupon_type`,
              discount_value: sql`EXCLUDED.discount_value`,
              affiliate_url: sql`EXCLUDED.affiliate_url`,
              is_verified: sql`EXCLUDED.is_verified`,
              is_exclusive: sql`EXCLUDED.is_exclusive`,
              is_featured: sql`EXCLUDED.is_featured`,
              expires_at: sql`EXCLUDED.expires_at`,
              updated_at: sql`NOW()`,
            },
          });
        imported += chunk.length;
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[Import] Database bulk insert failed:', error);
      errors.push(`Database error: ${errMsg}`);
      skipped += couponsToInsert.length;
    }
  }

  // Invalidate all related caches
  if (imported > 0) {
    await Promise.all([
      cache.delPattern('coupons:'),
      cache.delPattern('stores:'),
      cache.delPattern('store:'),
      cache.delPattern('search:'),
    ]);
  }

  return c.json({
    success: true,
    data: {
      imported,
      skipped,
      errors,
    },
  });
});

export { adminRouter };
