import { createMiddleware } from 'hono/factory';
import { Redis } from '@upstash/redis';
import type { AppBindings } from '../types';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const PUBLIC_RATE_LIMIT: RateLimitConfig = { maxRequests: 100, windowSeconds: 60 };
const AUTH_RATE_LIMIT: RateLimitConfig = { maxRequests: 30, windowSeconds: 60 };

/**
 * Sliding window rate limiting middleware using Upstash Redis.
 * - Public routes: 100 requests/min per IP
 * - Auth routes: 30 requests/min per user ID
 * Returns 429 with Retry-After header when limit is exceeded.
 */
export const rateLimitMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    await next();
    return;
  }

  const redis = new Redis({
    url: c.env.UPSTASH_REDIS_URL,
    token: c.env.UPSTASH_REDIS_TOKEN,
  });

  const user = c.get('user');
  const isAuthenticated = !!user;

  const config = isAuthenticated ? AUTH_RATE_LIMIT : PUBLIC_RATE_LIMIT;

  // Identify the client: use user ID for authenticated requests, IP hash for public
  const clientIp = c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const identifier = isAuthenticated ? `auth:${user.id}` : `ip:${clientIp}`;
  const key = `ratelimit:${identifier}`;

  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    // Use a Redis pipeline for atomicity
    const pipeline = redis.pipeline();

    // Remove expired entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current requests in the window
    pipeline.zcard(key);

    // Add the current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random().toString(36).slice(2)}` });

    // Set expiry on the key
    pipeline.expire(key, config.windowSeconds);

    const results = await pipeline.exec();

    // results[1] is the zcard result (count of requests in window)
    const requestCount = results[1] as number;

    if (requestCount >= config.maxRequests) {
      const retryAfter = Math.ceil(config.windowSeconds);

      return c.json(
        {
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowSeconds} seconds.`,
        },
        429,
        {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(now + config.windowSeconds * 1000).toISOString(),
        }
      );
    }

    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - requestCount - 1).toString());
    c.header('X-RateLimit-Reset', new Date(now + config.windowSeconds * 1000).toISOString());

    await next();
  } catch (error) {
    // If Redis is down, allow the request (fail open)
    console.error('Rate limiting error:', error);
    await next();
  }
});
