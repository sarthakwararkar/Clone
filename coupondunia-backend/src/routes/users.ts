import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { createDb } from '../db';
import { users, savedCoupons, coupons, stores } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { AppBindings, UserProfileResponse, CouponResponse, ApiResponse } from '../types';
import { sql } from 'drizzle-orm';

const usersRouter = new Hono<AppBindings>();

// Apply auth middleware to all user routes
usersRouter.use('*', authMiddleware);

// ─── Validation schemas ─────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

// ─── GET /api/me ────────────────────────────────────────────────────────────

usersRouter.get('/', async (c) => {
  const authUser = c.get('user')!;
  const db = createDb(c.env.DATABASE_URL);

  // Find or create user record
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.supabase_uid, authUser.id))
    .limit(1);

  if (!user && authUser.email) {
    // Check if user exists with the same email (e.g. from mock auth or previous registration)
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email))
      .limit(1);

    if (existingUser) {
      // Link the existing user record with the new supabase_uid
      // and fill in name/avatar_url if not already present
      const updateData: Record<string, any> = {
        supabase_uid: authUser.id,
        updated_at: new Date(),
      };
      if (!existingUser.name && authUser.name) updateData.name = authUser.name;
      if (!existingUser.avatar_url && authUser.avatar_url) updateData.avatar_url = authUser.avatar_url;

      [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existingUser.id))
        .returning();
    }
  }

  if (!user) {
    // Auto-create user on first login
    [user] = await db
      .insert(users)
      .values({
        supabase_uid: authUser.id,
        email: authUser.email,
        role: authUser.role,
        name: authUser.name || null,
        avatar_url: authUser.avatar_url || null,
      })
      .returning();
  }

  const profile: UserProfileResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at.toISOString(),
  };

  return c.json({ success: true, data: profile } as ApiResponse<UserProfileResponse>);
});

// ─── PATCH /api/me ──────────────────────────────────────────────────────────

usersRouter.patch('/', async (c) => {
  const authUser = c.get('user')!;
  const body = await c.req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);

  // Find or create user record
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.supabase_uid, authUser.id))
    .limit(1);

  if (!user && authUser.email) {
    // Check if user exists with the same email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email))
      .limit(1);

    if (existingUser) {
      // Link the existing user record with the new supabase_uid
      const updateData: Record<string, any> = {
        supabase_uid: authUser.id,
        updated_at: new Date(),
      };
      if (parsed.data.name !== undefined) {
        updateData.name = parsed.data.name;
      } else if (!existingUser.name && authUser.name) {
        updateData.name = authUser.name;
      }

      if (parsed.data.avatar_url !== undefined) {
        updateData.avatar_url = parsed.data.avatar_url;
      } else if (!existingUser.avatar_url && authUser.avatar_url) {
        updateData.avatar_url = authUser.avatar_url;
      }

      [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existingUser.id))
        .returning();
    }
  }

  if (!user) {
    // Auto-create user on first login/profile update if not exists
    [user] = await db
      .insert(users)
      .values({
        supabase_uid: authUser.id,
        email: authUser.email,
        role: authUser.role,
        name: parsed.data.name !== undefined ? parsed.data.name : (authUser.name || null),
        avatar_url: parsed.data.avatar_url !== undefined ? parsed.data.avatar_url : (authUser.avatar_url || null),
      })
      .returning();
  } else {
    // Update existing user record
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.avatar_url !== undefined) updateData.avatar_url = parsed.data.avatar_url;

    [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.supabase_uid, authUser.id))
      .returning();
  }

  if (!user) {
    return c.json({ success: false, error: 'Failed to update or create user' } as ApiResponse, 500);
  }

  const profile: UserProfileResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at.toISOString(),
  };

  return c.json({ success: true, data: profile });
});

// ─── GET /api/me/saved ──────────────────────────────────────────────────────

usersRouter.get('/saved', async (c) => {
  const authUser = c.get('user')!;
  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.supabase_uid, authUser.id))
    .limit(1);

  if (!user) {
    return c.json({ success: true, data: [] });
  }

  const result = await db.execute(sql`
    SELECT
      c.id, c.store_id, c.title, c.description, c.code, c.coupon_type,
      c.discount_value, c.affiliate_url, c.source, c.is_verified, c.is_exclusive,
      c.is_featured, c.expires_at, c.starts_at, c.success_rate, c.used_count,
      c.created_at,
      s.name AS store_name, s.slug AS store_slug, s.logo_url AS store_logo_url,
      s.banner_url AS store_banner_url,
      sc.saved_at
    FROM saved_coupons sc
    JOIN coupons c ON c.id = sc.coupon_id
    JOIN stores s ON s.id = c.store_id
    WHERE sc.user_id = ${user.id}
    ORDER BY sc.saved_at DESC
  `);

  const data: (CouponResponse & { saved_at: string })[] = (result.rows as Record<string, unknown>[]).map((row) => ({
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
    saved_at: new Date(row.saved_at as string).toISOString(),
    store: {
      id: row.store_id as string,
      name: row.store_name as string,
      slug: row.store_slug as string,
      logo_url: row.store_logo_url as string | null,
      banner_url: row.store_banner_url as string | null,
      website_url: null,
      affiliate_url: null,
      affiliate_network: null,
      description: null,
      category_id: null,
      is_featured: false,
      cashback_rate: null,
      created_at: '',
    },
  }));

  return c.json({ success: true, data });
});

// ─── POST /api/me/saved/:couponId ───────────────────────────────────────────

usersRouter.post('/saved/:couponId', async (c) => {
  const authUser = c.get('user')!;
  const couponId = c.req.param('couponId');
  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.supabase_uid, authUser.id))
    .limit(1);

  if (!user) {
    return c.json({ success: false, error: 'User not found' } as ApiResponse, 404);
  }

  // Verify coupon exists
  const [coupon] = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(eq(coupons.id, couponId))
    .limit(1);

  if (!coupon) {
    return c.json({ success: false, error: 'Coupon not found' } as ApiResponse, 404);
  }

  try {
    await db.insert(savedCoupons).values({
      user_id: user.id,
      coupon_id: couponId,
    });

    return c.json({ success: true, message: 'Coupon saved successfully' } as ApiResponse);
  } catch (error) {
    // Handle unique constraint violation (already saved)
    return c.json({ success: false, error: 'Coupon already saved' } as ApiResponse, 409);
  }
});

// ─── DELETE /api/me/saved/:couponId ─────────────────────────────────────────

usersRouter.delete('/saved/:couponId', async (c) => {
  const authUser = c.get('user')!;
  const couponId = c.req.param('couponId');
  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.supabase_uid, authUser.id))
    .limit(1);

  if (!user) {
    return c.json({ success: false, error: 'User not found' } as ApiResponse, 404);
  }

  const [deleted] = await db
    .delete(savedCoupons)
    .where(
      and(
        eq(savedCoupons.user_id, user.id),
        eq(savedCoupons.coupon_id, couponId)
      )
    )
    .returning();

  if (!deleted) {
    return c.json({ success: false, error: 'Saved coupon not found' } as ApiResponse, 404);
  }

  return c.json({ success: true, message: 'Coupon removed from saved' } as ApiResponse);
});

export { usersRouter };
