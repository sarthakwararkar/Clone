import { Redis } from '@upstash/redis';

/**
 * Cache service using Upstash Redis.
 * Provides get, set, delete, and pattern-based deletion.
 */
export class CacheService {
  private redis: Redis | null = null;

  constructor(url: string | undefined, token: string | undefined) {
    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
      } catch (error) {
        console.error('Failed to initialize Redis client in CacheService:', error);
        this.redis = null;
      }
    } else {
      console.warn('CacheService initialized without Redis credentials. Caching is disabled.');
    }
  }

  /**
   * Get a cached value by key.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get<T>(key);
      return data;
    } catch (error) {
      console.error(`Cache GET error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set a cached value with TTL in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error(`Cache SET error for key "${key}":`, error);
    }
  }

  /**
   * Delete a specific cache key.
   */
  async del(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache DEL error for key "${key}":`, error);
    }
  }

  /**
   * Delete all keys matching a prefix pattern.
   * Uses SCAN to find matching keys, then deletes them in batches.
   *
   * Example: delPattern('stores:') deletes all keys starting with 'stores:'
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    try {
      let cursor: string | number = 0;
      const keysToDelete: string[] = [];

      do {
        const [nextCursor, keys] = await this.redis.scan(cursor as any, {
          match: `${pattern}*`,
          count: 100,
        }) as [string, string[]];
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        // Delete in batches of 100
        for (let i = 0; i < keysToDelete.length; i += 100) {
          const batch = keysToDelete.slice(i, i + 100);
          await Promise.all(batch.map((key) => this.redis!.del(key)));
        }
      }
    } catch (error) {
      console.error(`Cache DEL pattern error for "${pattern}":`, error);
    }
  }
}

/**
 * Factory function to create a CacheService instance.
 */
export function createCacheService(url: string | undefined, token: string | undefined): CacheService {
  return new CacheService(url, token);
}
