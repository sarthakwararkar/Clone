import { createMiddleware } from 'hono/factory';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { AppBindings, AuthUser } from '../types';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

/**
 * Auth middleware — verifies Firebase ID Token from Authorization header.
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
    let payload: any = null;

    // Allow mock tokens if the mock secret is configured
    if (c.env.FIREBASE_MOCK_JWT_SECRET) {
      try {
        const secret = new TextEncoder().encode(c.env.FIREBASE_MOCK_JWT_SECRET);
        const { payload: mockPayload } = await jwtVerify(token, secret);
        payload = mockPayload;
      } catch {
        // Fall back to live verification if mock verification fails
      }
    }

    if (!payload) {
      const { payload: livePayload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
        audience: c.env.FIREBASE_PROJECT_ID,
      });
      payload = livePayload;
    }

    const firebaseData = (payload.firebase as Record<string, unknown>) || {};
    const signInProvider = (firebaseData.sign_in_provider as string) || 'password';

    const user: AuthUser = {
      id: payload.sub as string,
      email: (payload.email as string) || '',
      role: (payload.role as 'user' | 'admin') || 'user',
      name: (payload.name as string) || undefined,
      avatar_url: (payload.picture as string) || undefined,
      provider: signInProvider === 'google.com' ? 'google' : 'email',
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
    let payload: any = null;

    if (c.env.FIREBASE_MOCK_JWT_SECRET) {
      try {
        const secret = new TextEncoder().encode(c.env.FIREBASE_MOCK_JWT_SECRET);
        const { payload: mockPayload } = await jwtVerify(token, secret);
        payload = mockPayload;
      } catch {
        // Fall back to live
      }
    }

    if (!payload) {
      const { payload: livePayload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
        audience: c.env.FIREBASE_PROJECT_ID,
      });
      payload = livePayload;
    }

    const firebaseData = (payload.firebase as Record<string, unknown>) || {};
    const signInProvider = (firebaseData.sign_in_provider as string) || 'password';

    const user: AuthUser = {
      id: payload.sub as string,
      email: (payload.email as string) || '',
      role: (payload.role as 'user' | 'admin') || 'user',
      name: (payload.name as string) || undefined,
      avatar_url: (payload.picture as string) || undefined,
      provider: signInProvider === 'google.com' ? 'google' : 'email',
    };

    c.set('user', user);
  } catch {
    c.set('user', null);
  }

  await next();
});
