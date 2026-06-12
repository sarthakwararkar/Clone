/**
 * GitHub Actions Job: Sync Coupons from Affiliate Networks
 *
 * Runs every 6 hours via cron schedule.
 * Fetches coupons from vCommission, Admitad, and CJ Affiliate,
 * upserts them into the database, and invalidates Upstash cache.
 *
 * Usage: npx tsx src/jobs/syncCoupons.ts
 */

import { createDb } from '../db';
import { createAffiliateService } from '../services/affiliateService';
import { createCacheService } from '../services/cacheService';

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CouponDunia — Affiliate Coupon Sync Job');
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
  const affiliateService = createAffiliateService(db);
  const cache = createCacheService(
    process.env.UPSTASH_REDIS_URL!,
    process.env.UPSTASH_REDIS_TOKEN!
  );

  const allCoupons = [];
  const syncResults: Record<string, { count: number; error?: string }> = {};

  // ─── Sync vCommission ───────────────────────────────────────────────────

  if (process.env.VCOMMISSION_API_KEY) {
    console.log('\n📦 Syncing vCommission...');
    try {
      const coupons = await affiliateService.syncVCommission(process.env.VCOMMISSION_API_KEY);
      syncResults.vcommission = { count: coupons.length };
      allCoupons.push(...coupons);
      console.log(`   ✅ Fetched ${coupons.length} coupons from vCommission`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      syncResults.vcommission = { count: 0, error: message };
      console.error(`   ❌ vCommission sync failed: ${message}`);
    }
  } else {
    console.log('\n⏩ Skipping vCommission (no API key)');
    syncResults.vcommission = { count: 0, error: 'No API key configured' };
  }

  // ─── Sync Admitad ─────────────────────────────────────────────────────

  if (process.env.ADMITAD_CLIENT_ID && process.env.ADMITAD_CLIENT_SECRET) {
    console.log('\n📦 Syncing Admitad...');
    try {
      const coupons = await affiliateService.syncAdmitad(
        process.env.ADMITAD_CLIENT_ID,
        process.env.ADMITAD_CLIENT_SECRET
      );
      syncResults.admitad = { count: coupons.length };
      allCoupons.push(...coupons);
      console.log(`   ✅ Fetched ${coupons.length} coupons from Admitad`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      syncResults.admitad = { count: 0, error: message };
      console.error(`   ❌ Admitad sync failed: ${message}`);
    }
  } else {
    console.log('\n⏩ Skipping Admitad (no credentials)');
    syncResults.admitad = { count: 0, error: 'No credentials configured' };
  }

  // ─── Sync CJ Affiliate ───────────────────────────────────────────────

  if (process.env.CJ_API_KEY) {
    console.log('\n📦 Syncing CJ Affiliate...');
    try {
      const coupons = await affiliateService.syncCJAffiliate(process.env.CJ_API_KEY);
      syncResults.cj = { count: coupons.length };
      allCoupons.push(...coupons);
      console.log(`   ✅ Fetched ${coupons.length} coupons from CJ`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      syncResults.cj = { count: 0, error: message };
      console.error(`   ❌ CJ sync failed: ${message}`);
    }
  } else {
    console.log('\n⏩ Skipping CJ Affiliate (no API key)');
    syncResults.cj = { count: 0, error: 'No API key configured' };
  }

  // ─── Sync Cuelinks ───────────────────────────────────────────────────────

  if (process.env.CUELINKS_API_KEY) {
    console.log('\n📦 Syncing Cuelinks...');
    try {
      const coupons = await affiliateService.syncCuelinks(process.env.CUELINKS_API_KEY);
      syncResults.cuelinks = { count: coupons.length };
      allCoupons.push(...coupons);
      console.log(`   ✅ Fetched ${coupons.length} coupons from Cuelinks`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      syncResults.cuelinks = { count: 0, error: message };
      console.error(`   ❌ Cuelinks sync failed: ${message}`);
    }
  } else {
    console.log('\n⏩ Skipping Cuelinks (no API key)');
    syncResults.cuelinks = { count: 0, error: 'No API key configured' };
  }

  // ─── Upsert Coupons ──────────────────────────────────────────────────

  console.log(`\n💾 Upserting ${allCoupons.length} total coupons...`);

  if (allCoupons.length > 0) {
    const { inserted, updated } = await affiliateService.upsertCoupons(allCoupons);
    console.log(`   ✅ Inserted: ${inserted}, Updated: ${updated}`);
  } else {
    console.log('   ⏩ No coupons to upsert');
  }

  // ─── Invalidate Cache ────────────────────────────────────────────────

  console.log('\n🗑️  Invalidating Upstash cache...');
  await Promise.all([
    cache.delPattern('coupons:'),
    cache.delPattern('stores:'),
    cache.delPattern('store:'),
    cache.delPattern('coupon:'),
    cache.delPattern('search:'),
  ]);
  console.log('   ✅ Cache invalidated');

  // ─── Summary ──────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Sync Summary:');
  for (const [source, result] of Object.entries(syncResults)) {
    const status = result.error ? `❌ ${result.error}` : `✅ ${result.count} coupons`;
    console.log(`    ${source}: ${status}`);
  }
  console.log(`  Total coupons processed: ${allCoupons.length}`);
  console.log(`  Completed at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch((error) => {
  console.error('Fatal error in sync job:', error);
  process.exit(1);
});
