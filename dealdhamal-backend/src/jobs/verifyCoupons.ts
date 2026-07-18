import { sql, eq, and, or, gt, isNull } from 'drizzle-orm';
import { createDb } from '../db';
import { coupons } from '../db/schema';
import { createCacheService } from '../services/cacheService';

// Blacklist patterns for text checks
const EXPIRED_KEYWORDS = [
  /expired/i,
  /no longer active/i,
  /ended/i,
  /past deal/i,
  /not available/i,
  /promotion ended/i,
];

const FILLER_KEYWORDS = [
  'signup now & visit the page best features',
  'visit the page to get this deal',
  'visit the page for details',
  'best features',
];

const INVALID_CODE_PATTERNS = [
  /^expired$/i,
  /^dummy$/i,
  /^test$/i,
  /^n\/?a$/i,
  /notworking/i,
];

export async function runAutomaticVerification(db: any): Promise<{ totalVerified: number; deactivatedCount: number }> {
  console.log('🛡️ Starting automatic coupon verification...');

  // Get active coupons
  const activeCoupons = await db.select({
    id: coupons.id,
    title: coupons.title,
    description: coupons.description,
    code: coupons.code,
    affiliate_url: coupons.affiliate_url,
    success_rate: coupons.success_rate,
    used_count: coupons.used_count,
    source: coupons.source,
  })
  .from(coupons)
  .where(
    and(
      or(gt(coupons.expires_at, new Date()), isNull(coupons.expires_at))
    )
  );

  console.log(`   Fetched ${activeCoupons.length} active coupons to verify.`);

  let deactivatedCount = 0;

  for (const coupon of activeCoupons) {
    let shouldDeactivate = false;
    let reason = '';

    const title = (coupon.title || '').trim();
    const description = (coupon.description || '').trim();
    const code = (coupon.code || '').trim();
    const url = coupon.affiliate_url || '';

    // ─── Heuristic Check 1: Title/Description Expiry Text ───
    for (const pat of EXPIRED_KEYWORDS) {
      if (pat.test(title) || pat.test(description)) {
        shouldDeactivate = true;
        reason = `Text match: ${pat.toString()}`;
        break;
      }
    }

    // ─── Heuristic Check 2: Filler Text ───
    if (!shouldDeactivate) {
      const lowerDesc = description.toLowerCase();
      const hasFiller = FILLER_KEYWORDS.some(pat => lowerDesc.includes(pat));
      if (hasFiller) {
        shouldDeactivate = true;
        reason = `Filler text detected in description`;
      }
    }

    // ─── Heuristic Check 3: Invalid Code ───
    if (!shouldDeactivate && code) {
      const isInvalidCode = INVALID_CODE_PATTERNS.some(pat => pat.test(code));
      if (isInvalidCode) {
        shouldDeactivate = true;
        reason = `Invalid coupon code format: "${code}"`;
      }
    }

    // ─── Check 4: Link Health Check (Non-blocking ping) ───
    if (!shouldDeactivate && url) {
      // Skip placeholder/non-URL values (e.g. seed data with literal variable names)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log(`   [Skip] Non-URL affiliate_url for "${title}": "${url}"`);
      } else {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(5000), // 5 seconds timeout
          });

          // 404 indicates a dead redirect page
          if (response.status === 404) {
            shouldDeactivate = true;
            reason = `URL health check returned 404`;
          } else {
            const finalUrl = response.url.toLowerCase();
            if (finalUrl.includes('/404') || finalUrl.includes('/error') || finalUrl.includes('/expired') || finalUrl.includes('/page-not-found')) {
              shouldDeactivate = true;
              reason = `URL redirected to a dead page: ${response.url}`;
            }
          }
        } catch (err: any) {
          // Log connection failures, but don't auto-deactivate immediately to prevent false positives from transient network issues
          console.log(`   [Ping Warning] Failed to fetch url for coupon "${title}": ${err.message || err}`);
        }
      }
    }

    if (shouldDeactivate) {
      try {
        await db.update(coupons)
          .set({
            expires_at: new Date(Date.now() - 1000), // Mark as expired
            updated_at: new Date()
          })
          .where(eq(coupons.id, coupon.id));

        console.log(`   Deactivated: "${title}" | Reason: ${reason}`);
        deactivatedCount++;
      } catch (dbErr) {
        console.error(`   ❌ Failed to deactivate coupon ${coupon.id}:`, dbErr);
      }
    }
  }

  console.log(`🛡️ Automatic verification completed. Deactivated ${deactivatedCount} coupons.`);
  return { totalVerified: activeCoupons.length, deactivatedCount };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }
  const db = createDb(process.env.DATABASE_URL);
  
  const results = await runAutomaticVerification(db);

  // Invalidate cache if coupons were deactivated
  if (results.deactivatedCount > 0 && process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    console.log('🗑️ Invalidating Upstash cache...');
    const cache = createCacheService(process.env.UPSTASH_REDIS_URL, process.env.UPSTASH_REDIS_TOKEN);
    await Promise.all([
      cache.delPattern('coupons:'),
      cache.delPattern('stores:'),
      cache.delPattern('store:'),
      cache.delPattern('coupon:'),
      cache.delPattern('search:'),
    ]);
    console.log('   Cache invalidated.');
  }
}

// Check if running directly
const isMain = process.argv[1] && (
  process.argv[1].endsWith('verifyCoupons.ts') || 
  process.argv[1].endsWith('verifyCoupons.js')
);

if (isMain) {
  main().catch(err => {
    console.error('Fatal error in verifyCoupons script:', err);
    process.exit(1);
  });
}
