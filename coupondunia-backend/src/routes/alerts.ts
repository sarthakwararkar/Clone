import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { createDb } from '../db';
import { dealAlerts, users, googleUsers, normalUsers } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { createEmailService } from '../services/emailService';
import type { AppBindings, DealAlertResponse, ApiResponse } from '../types';

const alertsRouter = new Hono<AppBindings>();

// Apply auth middleware to all alert routes
alertsRouter.use('*', authMiddleware);

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getInternalUserId(db: any, authUser: { id: string; provider?: string }) {
  if (authUser.provider === 'google') {
    const [res] = await db
      .select({ id: googleUsers.id })
      .from(googleUsers)
      .where(eq(googleUsers.firebase_uid, authUser.id))
      .limit(1);
    return res?.id || null;
  } else {
    const [res] = await db
      .select({ id: normalUsers.id })
      .from(normalUsers)
      .where(eq(normalUsers.firebase_uid, authUser.id))
      .limit(1);
    return res?.id || null;
  }
}

// ─── Validation schemas ─────────────────────────────────────────────────────

const createAlertSchema = z.object({
  email: z.string().email(),
  store_id: z.string().uuid().optional(),
  category_id: z.number().int().positive().optional(),
});

// ─── POST /api/alerts ───────────────────────────────────────────────────────

alertsRouter.post('/', async (c) => {
  const authUser = c.get('user')!;
  const body = await c.req.json();
  const parsed = createAlertSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid request body', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  // Must have at least one of store_id or category_id
  if (!parsed.data.store_id && !parsed.data.category_id) {
    return c.json(
      { success: false, error: 'At least one of store_id or category_id is required' } as ApiResponse,
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const internalUserId = await getInternalUserId(db, authUser);

  if (!internalUserId) {
    return c.json({ success: false, error: 'User not found' } as ApiResponse, 404);
  }

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, internalUserId))
    .limit(1);

  // Create the alert
  const [alert] = await db
    .insert(dealAlerts)
    .values({
      user_id: internalUserId,
      email: parsed.data.email,
      store_id: parsed.data.store_id ?? null,
      category_id: parsed.data.category_id ?? null,
    })
    .returning();

  // Send welcome email
  try {
    const emailService = createEmailService(c.env.RESEND_API_KEY, c.env.FROM_EMAIL);
    await emailService.sendWelcomeEmail(
      parsed.data.email,
      user?.name || authUser.email.split('@')[0]
    );
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the request if email fails
  }

  const response: DealAlertResponse = {
    id: alert.id,
    email: alert.email,
    store_id: alert.store_id,
    category_id: alert.category_id,
    is_active: alert.is_active,
    created_at: alert.created_at.toISOString(),
  };

  return c.json({ success: true, data: response } as ApiResponse<DealAlertResponse>, 201);
});

// ─── GET /api/alerts ────────────────────────────────────────────────────────

alertsRouter.get('/', async (c) => {
  const authUser = c.get('user')!;
  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const internalUserId = await getInternalUserId(db, authUser);

  if (!internalUserId) {
    return c.json({ success: true, data: [] });
  }

  const alerts = await db
    .select()
    .from(dealAlerts)
    .where(and(eq(dealAlerts.user_id, internalUserId), eq(dealAlerts.is_active, true)));

  const data: DealAlertResponse[] = alerts.map((alert) => ({
    id: alert.id,
    email: alert.email,
    store_id: alert.store_id,
    category_id: alert.category_id,
    is_active: alert.is_active,
    created_at: alert.created_at.toISOString(),
  }));

  return c.json({ success: true, data });
});

// ─── DELETE /api/alerts/:id ─────────────────────────────────────────────────

alertsRouter.delete('/:id', async (c) => {
  const alertId = c.req.param('id');
  const authUser = c.get('user')!;
  const db = createDb(c.env.DATABASE_URL);

  // Get user's internal ID
  const internalUserId = await getInternalUserId(db, authUser);

  if (!internalUserId) {
    return c.json({ success: false, error: 'User not found' } as ApiResponse, 404);
  }

  // Deactivate the alert (soft delete)
  const [updated] = await db
    .update(dealAlerts)
    .set({ is_active: false })
    .where(and(eq(dealAlerts.id, alertId), eq(dealAlerts.user_id, internalUserId)))
    .returning();

  if (!updated) {
    return c.json({ success: false, error: 'Alert not found' } as ApiResponse, 404);
  }

  return c.json({ success: true, message: 'Alert deactivated' } as ApiResponse);
});

export { alertsRouter };
