import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { sentryMiddleware } from './middleware/sentry';
import { couponsRouter } from './routes/coupons';
import { storesRouter } from './routes/stores';
import { categoriesRouter } from './routes/categories';
import { usersRouter } from './routes/users';
import { alertsRouter } from './routes/alerts';
import { adminRouter } from './routes/admin';
import { createDb } from './db';
import { createCacheService } from './services/cacheService';
import { createSearchService } from './services/searchService';
import type { AppBindings, HealthResponse, SearchResult, ApiResponse } from './types';

// ─── Create Hono App ────────────────────────────────────────────────────────

const app = new Hono<AppBindings>();

// ─── Global Middleware ──────────────────────────────────────────────────────

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
}));

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', sentryMiddleware);
app.use('*', rateLimitMiddleware);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/api/health', (c) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown',
  };
  return c.json(response);
});

// ─── Search Route ───────────────────────────────────────────────────────────

app.get('/api/search', async (c) => {
  const query = c.req.query('q');

  if (!query || query.trim().length === 0) {
    return c.json(
      { success: false, error: 'Search query is required (q parameter)' } as ApiResponse,
      400
    );
  }

  const trimmedQuery = query.trim();
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  // Check cache
  const cacheKey = `search:${trimmedQuery.toLowerCase()}`;
  const cached = await cache.get<SearchResult>(cacheKey);
  if (cached) {
    return c.json({ success: true, data: cached } as ApiResponse<SearchResult>);
  }

  const db = createDb(c.env.DATABASE_URL);
  const searchService = createSearchService(db);

  const [searchedCoupons, searchedStores] = await Promise.all([
    searchService.searchCoupons(trimmedQuery, 20),
    searchService.searchStores(trimmedQuery, 10),
  ]);

  const result: SearchResult = {
    coupons: searchedCoupons,
    stores: searchedStores,
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);

  return c.json({ success: true, data: result });
});

// ─── Mount Route Groups ─────────────────────────────────────────────────────

app.route('/api/coupons', couponsRouter);
app.route('/api/stores', storesRouter);
app.route('/api/categories', categoriesRouter);
app.route('/api/me', usersRouter);
app.route('/api/alerts', alertsRouter);
app.route('/api/admin', adminRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    } as ApiResponse,
    404
  );
});

// ─── Global Error Handler ───────────────────────────────────────────────────

app.onError((err, c) => {
  console.error('Unhandled error:', err);

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        success: false,
        error: 'Validation Error',
        message: err.message,
      } as ApiResponse,
      400
    );
  }

  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'An unexpected error occurred',
    } as ApiResponse,
    500
  );
});

// ─── Export Cloudflare Workers Handler ───────────────────────────────────────

export default app;
