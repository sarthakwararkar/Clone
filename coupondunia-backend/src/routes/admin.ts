import { Hono } from 'hono';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { createDb } from '../db';
import { coupons, stores } from '../db/schema';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { createCouponService } from '../services/couponService';
import { createCacheService } from '../services/cacheService';
import { createR2Service } from '../services/r2Service';
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
  website_url: z.string().url().optional(),
  affiliate_url: z.string().url().optional(),
  affiliate_network: z.string().optional(),
  description: z.string().max(2000).optional(),
  category_id: z.number().int().positive().optional(),
  is_featured: z.boolean().optional(),
  cashback_rate: z.string().optional(),
});

const updateStoreSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  website_url: z.string().url().optional(),
  affiliate_url: z.string().url().optional(),
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
      const r2Service = createR2Service(c.env.R2_BUCKET, c.env.R2_PUBLIC_URL);
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `stores/logos/${storeData.slug}.${ext}`;
      const arrayBuffer = await logoFile.arrayBuffer();
      logoUrl = await r2Service.uploadFile(key, arrayBuffer, logoFile.type);
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
      logo_url: logoUrl,
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
      const r2Service = createR2Service(c.env.R2_BUCKET, c.env.R2_PUBLIC_URL);

      // Delete old logo if exists
      const [existingStore] = await db
        .select({ logo_url: stores.logo_url, slug: stores.slug })
        .from(stores)
        .where(eq(stores.id, id))
        .limit(1);

      if (existingStore?.logo_url) {
        const oldKey = r2Service.getKeyFromUrl(existingStore.logo_url);
        if (oldKey) {
          await r2Service.deleteFile(oldKey);
        }
      }

      const slug = updateData.slug || existingStore?.slug || id;
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `stores/logos/${slug}.${ext}`;
      const arrayBuffer = await logoFile.arrayBuffer();
      newLogoUrl = await r2Service.uploadFile(key, arrayBuffer, logoFile.type);
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
  if (updateData.website_url !== undefined) setData.website_url = updateData.website_url;
  if (updateData.affiliate_url !== undefined) setData.affiliate_url = updateData.affiliate_url;
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

export { adminRouter };
