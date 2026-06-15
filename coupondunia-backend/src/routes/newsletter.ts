import { Hono } from 'hono';
import { z } from 'zod';
import { createDb } from '../db';
import { newsletterSubscribers } from '../db/schema';
import { createEmailService } from '../services/emailService';
import type { AppBindings, ApiResponse } from '../types';

const newsletterRouter = new Hono<AppBindings>();

const subscribeSchema = z.object({
  email: z.string().email(),
});

// POST /api/newsletter
newsletterRouter.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, error: 'Invalid email address', message: parsed.error.message } as ApiResponse,
      400
    );
  }

  const { email } = parsed.data;
  const db = createDb(c.env.DATABASE_URL);

  try {
    // Upsert the subscriber: if they already exist, make sure is_active is true
    await db
      .insert(newsletterSubscribers)
      .values({ email, is_active: true })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { is_active: true },
      });

    // Send welcome email
    try {
      const emailService = createEmailService(c.env.RESEND_API_KEY);
      await emailService.sendWelcomeEmail(email, email.split('@')[0]);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Do not fail the API request if the email dispatch fails
    }

    return c.json({ success: true, message: 'Subscribed successfully' } as ApiResponse, 200);
  } catch (error) {
    console.error('Newsletter subscription database error:', error);
    return c.json({ success: false, error: 'Database error occurred' } as ApiResponse, 500);
  }
});

export { newsletterRouter };
