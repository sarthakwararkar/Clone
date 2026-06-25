import { Hono } from 'hono';
import { createDb } from '../db';
import { youtubeCommentators } from '../db/schema';
import { createCacheService } from '../services/cacheService';
import { desc } from 'drizzle-orm';
import type { AppBindings, ApiResponse } from '../types';

export interface YoutubeCommentatorResponse {
  id: string;
  name: string;
  youtube_handle: string | null;
  avatar_url: string | null;
  channel_url: string | null;
  comment_text: string | null;
  is_featured: boolean;
  created_at: string;
}

const commentatorsRouter = new Hono<AppBindings>();

// ─── GET /api/commentators ──────────────────────────────────────────────────

commentatorsRouter.get('/', async (c) => {
  const cache = createCacheService(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);

  const cacheKey = 'commentators:all';
  const cached = await cache.get<YoutubeCommentatorResponse[]>(cacheKey);
  if (cached) {
    return c.json({ success: true, data: cached } as ApiResponse<YoutubeCommentatorResponse[]>);
  }

  const db = createDb(c.env.DATABASE_URL);

  const allCommentators = await db
    .select({
      id: youtubeCommentators.id,
      name: youtubeCommentators.name,
      youtube_handle: youtubeCommentators.youtube_handle,
      avatar_url: youtubeCommentators.avatar_url,
      channel_url: youtubeCommentators.channel_url,
      comment_text: youtubeCommentators.comment_text,
      is_featured: youtubeCommentators.is_featured,
      created_at: youtubeCommentators.created_at,
    })
    .from(youtubeCommentators)
    .orderBy(desc(youtubeCommentators.created_at));

  const data: YoutubeCommentatorResponse[] = allCommentators.map((item) => ({
    id: item.id,
    name: item.name,
    youtube_handle: item.youtube_handle,
    avatar_url: item.avatar_url,
    channel_url: item.channel_url,
    comment_text: item.comment_text,
    is_featured: item.is_featured,
    created_at: item.created_at.toISOString(),
  }));

  // Cache for 1 hour
  await cache.set(cacheKey, data, 3600);

  return c.json({ success: true, data });
});

export { commentatorsRouter };
