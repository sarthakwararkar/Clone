import { Hono } from 'hono';
import { createDb } from '../db';
import { categories } from '../db/schema';
import { createCacheService } from '../services/cacheService';
import type { AppBindings, CategoryResponse, ApiResponse } from '../types';

const categoriesRouter = new Hono<AppBindings>();

// ─── GET /api/categories ────────────────────────────────────────────────────

categoriesRouter.get('/', async (c) => {
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  // Try cache first
  const cacheKey = 'categories:all';
  const cached = await cache.get<CategoryResponse[]>(cacheKey);
  if (cached) {
    return c.json({ success: true, data: cached } as ApiResponse<CategoryResponse[]>);
  }

  const db = createDb(c.env.DATABASE_URL);

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon_url: categories.icon_url,
      created_at: categories.created_at,
    })
    .from(categories)
    .orderBy(categories.name);

  const data: CategoryResponse[] = allCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon_url: cat.icon_url,
    created_at: cat.created_at.toISOString(),
  }));

  // Cache for 1 hour
  await cache.set(cacheKey, data, 3600);

  return c.json({ success: true, data });
});

export { categoriesRouter };
