import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import type { AppBindings, AuthUser } from '../types';

/**
 * Auth middleware — verifies Supabase JWT from Authorization header.
 * Sets c.set('user', { id, email, role }) on success.
 * Returns 401 if token is missing or invalid.
 */
export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: `${c.env.SUPABASE_URL}/auth/v1`,
    });

    const metadata = (payload.user_metadata as Record<string, unknown>) || {};
    const user: AuthUser = {
      id: payload.sub as string,
      email: (payload.email as string) || '',
      role: (metadata.role as 'user' | 'admin') || 'user',
      name: (metadata.name as string) || (metadata.full_name as string) || undefined,
      avatar_url: (metadata.avatar_url as string) || (metadata.picture as string) || undefined,
    };

    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
});

/**
 * Admin middleware — must be used AFTER authMiddleware.
 * Checks that the authenticated user has role === 'admin'.
 * Returns 403 if the user is not an admin.
 */
export const adminMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ success: false, error: 'Admin access required' }, 403);
  }

  await next();
});

/**
 * Optional auth middleware — extracts user if token is present but doesn't
 * reject requests without a token. Useful for routes where auth is optional
 * (e.g., click tracking for anonymous users).
 */
export const optionalAuthMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    c.set('user', null);
    await next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: `${c.env.SUPABASE_URL}/auth/v1`,
    });

    const metadata = (payload.user_metadata as Record<string, unknown>) || {};
    const user: AuthUser = {
      id: payload.sub as string,
      email: (payload.email as string) || '',
      role: (metadata.role as 'user' | 'admin') || 'user',
      name: (metadata.name as string) || (metadata.full_name as string) || undefined,
      avatar_url: (metadata.avatar_url as string) || (metadata.picture as string) || undefined,
    };

    c.set('user', user);
  } catch {
    c.set('user', null);
  }

  await next();
});
