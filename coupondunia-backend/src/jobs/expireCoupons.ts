/**
 * GitHub Actions Job: Expire Old Coupons
 *
 * Runs daily at midnight via cron schedule.
 * Marks coupons with expires_at < now() as updated,
 * and invalidates all Upstash cache.
 *
 * Usage: npx tsx src/jobs/expireCoupons.ts
 */

import { sql } from 'drizzle-orm';
import { createDb } from '../db';
import { coupons } from '../db/schema';
import { createCacheService } from '../services/cacheService';

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CouponDunia — Expire Coupons Job');
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');

  // Validate required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'UPSTASH_REDIS_URL', 'UPSTASH_REDIS_TOKEN'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const db = createDb(process.env.DATABASE_URL!);
  const cache = createCacheService(
    process.env.UPSTASH_REDIS_URL!,
    process.env.UPSTASH_REDIS_TOKEN!
  );

  // ─── Mark Expired Coupons ─────────────────────────────────────────────

  console.log('\n⏰ Checking for expired coupons...');

  const result = await db.execute(sql`
    UPDATE coupons
    SET updated_at = NOW()
    WHERE expires_at < NOW()
      AND expires_at IS NOT NULL
      AND (updated_at IS NULL OR updated_at < expires_at)
    RETURNING id
  `);

  const expiredCount = result.rows.length;
  console.log(`   ✅ Marked ${expiredCount} coupons as expired`);

  // ─── Clean up Expired Coupons ─────────────────────────────────────────

  console.log('\n🧹 Cleaning up old expired coupons with no clicks/reports...');
  const deleteResult = await db.execute(sql`
    DELETE FROM coupons
    WHERE expires_at < NOW()
      AND id NOT IN (SELECT DISTINCT coupon_id FROM coupon_clicks)
      AND id NOT IN (SELECT DISTINCT coupon_id FROM coupon_reports)
  `);
  const deletedCount = deleteResult.rowCount || 0;
  console.log(`   ✅ Deleted ${deletedCount} expired coupons from database`);

  // ─── Invalidate All Cache ─────────────────────────────────────────────

  console.log('\n🗑️  Invalidating Upstash cache...');
  await Promise.all([
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('coupon:'),
    cache.delPattern('search:'),
    cache.delPattern('categories:'),
  ]);
  console.log('   ✅ All cache invalidated');

  // ─── Summary ──────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Expired coupons processed: ${expiredCount}`);
  console.log(`  Completed at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch((error) => {
  console.error('Fatal error in expire coupons job:', error);
  process.exit(1);
});
