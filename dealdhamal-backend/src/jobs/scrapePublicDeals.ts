import * as cheerio from 'cheerio';
import { sql, eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createDb } from '../db';
import { stores, coupons, categories } from '../db/schema';
import { ensureDefaultCoupons } from './ensureCoupons';
import { runAutomaticVerification } from './verifyCoupons';

// ─── Directories & Paths ──────────────────────────────────────────────────────

const outputDir = path.join(process.cwd(), 'output');
const logsDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'scraper.log');
const outputFilePath = path.join(outputDir, 'deals_latest.json');

// ─── Logger Function ─────────────────────────────────────────────────────────

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(logFilePath, line);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanText = (str: string): string => {
  return str ? str.trim().replace(/\s+/g, ' ') : '';
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Levenshtein Similarity for title deduplication (>85%)
function levenshtein(a: string, b: string): number {
  const tmp: number[][] = [];
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (let i = 0; i <= alen; i++) tmp[i] = [i];
  for (let j = 0; j <= blen; j++) tmp[0][j] = j;
  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[alen][blen];
}

function titleSimilarity(a: string, b: string): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(a, b);
  return (maxLen - dist) / maxLen;
}

// Category Normalizer
function normalizeCategory(slug: string | null): string {
  if (!slug) return 'Other';
  const mapping: Record<string, string> = {
    'fashion': 'Fashion',
    'electronics': 'Electronics',
    'food': 'Food & Dining',
    'beauty': 'Beauty',
    'travel': 'Travel',
    'grocery': 'Grocery',
    'health': 'Health',
    'home-living': 'Home & Kitchen',
  };
  return mapping[slug.toLowerCase()] || 'Other';
}

// ─── Fetch Page with Timeout & User-Agent ────────────────────────────────────

async function fetchPage(url: string, timeoutMs = 15000, retries = 1): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    clearTimeout(id);

    if (response.status === 404) {
      throw new Error(`HTTP 404 Not Found`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error: any) {
    clearTimeout(id);
    if (retries > 0) {
      log(`⚠️ Fetch failed for ${url}. Retrying in 10s... Error: ${error.message || error}`);
      await sleep(10000);
      return fetchPage(url, timeoutMs, retries - 1);
    }
    throw error;
  }
}

// ─── Site URL Mappings ───────────────────────────────────────────────────────

function getUrlSlugs(dbSlug: string) {
  let cashkaro = dbSlug;
  let grabon = dbSlug;
  let coupondunia = dbSlug;

  if (dbSlug === 'amazon-india') {
    cashkaro = 'amazon';
    grabon = 'amazon';
    coupondunia = 'amazon';
  } else if (dbSlug === 'ajio') {
    cashkaro = 'ajio-coupons';
  } else if (dbSlug === 'makemytrip') {
    cashkaro = 'makemytrip-domesticflights';
  }

  return { cashkaro, grabon, coupondunia };
}

// ─── Site-Specific Scraping and Parsing ──────────────────────────────────────

// 1. CouponDunia Parser
function parseCouponDunia(html: string, storeName: string, storeLogo: string | null, category: string, storeUrl: string, storeSlug: string): any[] {
  const $ = cheerio.load(html);
  const deals: any[] = [];

  $('.offer-card-ctr').each((_, el) => {
    const title = cleanText($(el).find('.offer-desc').attr('data-offer-value') || $(el).find('.offer-desc').text());
    if (!title) return;

    let code = $(el).find('.get-offer-code').attr('data-offer-value') || null;
    if (code) {
      code = cleanText(code);
      if (/show|reveal|activate|click|deal|get/i.test(code)) code = null;
    }

    const discount = cleanText($(el).find('.offer-title').attr('data-offer-value') || $(el).find('.ofr-value').text()) || 'Get Deal';
    
    let description = cleanText($(el).find('.full-desc').text() || $(el).find('.offer-desc-list').text());
    if (!description) description = title;

    const offerId = $(el).find('.offer-desc').attr('data-offer-id') || $(el).find('.get-offer-code').parent().attr('data-offer-value') || '';
    const deal_url = offerId ? `https://www.coupondunia.in/${storeSlug}?h=${offerId}` : storeUrl;

    const is_verified = $(el).find('.verified-tag').length > 0 || $(el).text().toLowerCase().includes('verified');

    deals.push({
      id: crypto.randomUUID(),
      title,
      description,
      code,
      discount,
      store_name: storeName,
      store_logo_url: storeLogo,
      deal_url,
      category,
      source_site: 'coupondunia',
      expiry_date: null,
      is_verified,
      unverified_expiry: true,
      scraped_at: new Date().toISOString()
    });
  });

  return deals;
}

// 2. CashKaro Parser
function parseCashKaro(html: string, storeName: string, storeLogo: string | null, category: string, dealUrl: string): any[] {
  const $ = cheerio.load(html);
  const deals: any[] = [];
  
  const nextDataHtml = $('script#__NEXT_DATA__').html();
  if (!nextDataHtml) return deals;

  try {
    const parsed = JSON.parse(nextDataHtml);
    const included = parsed.props?.pageProps?.apiData?.included || [];
    
    const couponsItem = included.find((item: any) => item && item.coupons);
    const coupons = couponsItem ? couponsItem.coupons : [];

    for (const coupon of coupons) {
      const attr = coupon.attributes || {};
      const title = cleanText(attr.title || '');
      if (!title) continue;

      let code = attr.code || attr.coupon_code || attr.promo_code || null;
      if (code) {
        code = cleanText(code);
        if (/show|reveal|activate|click|deal|get/i.test(code)) code = null;
      }

      let description = attr.description || '';
      description = description.replace(/<[^>]*>/g, '');
      description = cleanText(description) || title;

      const discount = cleanText(attr.exclusive_text || attr.cashback_text || '') || 'Get Cashback';
      
      let expiry_date: string | null = attr.expiry_date || null;
      if (expiry_date) {
        try {
          expiry_date = new Date(expiry_date).toISOString();
        } catch {
          expiry_date = null;
        }
      }

      deals.push({
        id: crypto.randomUUID(),
        title,
        description,
        code,
        discount,
        store_name: storeName,
        store_logo_url: storeLogo,
        deal_url: attr.cashback_url || dealUrl,
        category,
        source_site: 'cashkaro',
        expiry_date,
        is_verified: true,
        unverified_expiry: expiry_date === null,
        scraped_at: new Date().toISOString()
      });
    }
  } catch (err) {
    log(`⚠️ Error parsing CashKaro NextData: ${err}`);
  }

  return deals;
}

// 3. GrabOn Parser
function parseGrabOn(html: string, storeName: string, storeLogo: string | null, category: string, dealUrl: string, sourceSite: 'grabon' | 'grabon_coupons'): any[] {
  const $ = cheerio.load(html);
  const deals: any[] = [];

  $('.gc-box').each((_, el) => {
    const title = cleanText($(el).find('.title').first().text());
    if (!title) return;

    let code = $(el).attr('data-code') || $(el).find('[data-code]').attr('data-code') || null;
    if (code) {
      code = cleanText(code);
      if (/show|reveal|activate|click|deal|get/i.test(code)) code = null;
    }

    const discount = cleanText($(el).find('.bm').first().text()) || 'Get Deal';
    const description = cleanText($(el).find('.details-desc, .desc-txt').first().text()) || title;
    const is_verified = $(el).text().toLowerCase().includes('verified') || $(el).find('[data-type="verified-view"]').length > 0;

    deals.push({
      id: crypto.randomUUID(),
      title,
      description,
      code,
      discount,
      store_name: storeName,
      store_logo_url: storeLogo,
      deal_url: dealUrl,
      category,
      source_site: sourceSite,
      expiry_date: null,
      is_verified,
      unverified_expiry: true,
      scraped_at: new Date().toISOString()
    });
  });

  return deals;
}

// ─── Expiry & Validation Rules ──────────────────────────────────────────────

function validateDeal(deal: any): { valid: boolean; reason?: string } {
  if (deal.expiry_date) {
    const exp = new Date(deal.expiry_date);
    if (exp.getTime() < Date.now()) {
      return { valid: false, reason: 'EXPIRED_DATE' };
    }
  }
  if (deal.code) {
    if (/expired/i.test(deal.code) || /not working/i.test(deal.code)) {
      return { valid: false, reason: 'EXPIRED_CODE_TEXT' };
    }
  }
  const expiredPattern = /expired|past deal|not available/i;
  if (expiredPattern.test(deal.title) || expiredPattern.test(deal.description) || expiredPattern.test(deal.discount)) {
    return { valid: false, reason: 'EXPIRED_BADGE_TEXT' };
  }

  // Content Quality Validation (Issue 5)
  const lowerTitle = (deal.title || '').toLowerCase().trim();
  const lowerDesc = (deal.description || '').toLowerCase().trim();

  // 1. Reject if headline is generic CTA text
  const ctaPatterns = ['get deal', 'get code', 'grab deal', 'click here', 'shop now', 'show code', 'reveal code', 'reveal', 'grab offer'];
  if (ctaPatterns.includes(lowerTitle)) {
    return { valid: false, reason: 'GENERIC_TITLE_CTA' };
  }

  // 2. Reject if title is too short (less than 10 characters)
  if (lowerTitle.length < 10) {
    return { valid: false, reason: 'TITLE_TOO_SHORT' };
  }

  // 3. Reject if description matches generic placeholder text
  const fillerPatterns = [
    'signup now & visit the page best features',
    'visit the page to get this deal',
    'visit the page for details',
    'best features',
  ];
  const isFillerDesc = fillerPatterns.some(pat => lowerDesc.includes(pat));
  if (isFillerDesc) {
    return { valid: false, reason: 'FILLER_DESCRIPTION' };
  }

  // 4. Reject if description is too short (less than 10 chars) unless it's identical to title and title is good
  if (lowerDesc.length < 10 && lowerDesc !== lowerTitle) {
    return { valid: false, reason: 'DESCRIPTION_TOO_SHORT' };
  }

  return { valid: true };
}

// ─── Deduplication Rules ────────────────────────────────────────────────────

function getCompletenessScore(d: any): number {
  let score = 0;
  if (d.code) score += 3;
  if (d.expiry_date) score += 2;
  if (d.is_verified) score += 1;
  return score;
}

function deduplicateDeals(allDeals: any[]): { unique: any[]; removedCount: number } {
  const uniqueDeals: any[] = [];
  let duplicatesRemovedCount = 0;

  const sourcePriority: Record<string, number> = {
    'coupondunia': 1,
    'cashkaro': 2,
    'grabon': 3,
    'grabon_coupons': 4
  };

  const sortedDeals = [...allDeals].sort((a, b) => {
    return (sourcePriority[a.source_site] || 5) - (sourcePriority[b.source_site] || 5);
  });

  for (const deal of sortedDeals) {
    let isDuplicate = false;
    let duplicateIndex = -1;

    for (let i = 0; i < uniqueDeals.length; i++) {
      const u = uniqueDeals[i];
      if (u.store_name.toLowerCase() !== deal.store_name.toLowerCase()) continue;

      if (u.code && deal.code) {
        if (u.code.toLowerCase() === deal.code.toLowerCase()) {
          isDuplicate = true;
          duplicateIndex = i;
          break;
        }
      } else if (!u.code && !deal.code) {
        if (u.discount.toLowerCase() === deal.discount.toLowerCase() && titleSimilarity(u.title, deal.title) > 0.85) {
          isDuplicate = true;
          duplicateIndex = i;
          break;
        }
      }
    }

    if (isDuplicate) {
      duplicatesRemovedCount++;
      const existing = uniqueDeals[duplicateIndex];
      const scoreExisting = getCompletenessScore(existing);
      const scoreNew = getCompletenessScore(deal);

      if (scoreNew > scoreExisting) {
        uniqueDeals[duplicateIndex] = deal;
      }
    } else {
      uniqueDeals.push(deal);
    }
  }

  return { unique: uniqueDeals, removedCount: duplicatesRemovedCount };
}

// ─── Main Pipeline Execution ─────────────────────────────────────────────────

export async function main() {
  log('═══════════════════════════════════════════════════════');
  log('  DealHunterBot — Daily Deal Scraping Pipeline');
  log(`  Started at: ${new Date().toISOString()}`);
  log('═══════════════════════════════════════════════════════');

  if (!process.env.DATABASE_URL) {
    log('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const db = createDb(process.env.DATABASE_URL);
  
  // 1. Fetch Stores from Database dynamically
  log('🏪 Loading active stores from database...');
  const dbStores = await db.select({
    id: stores.id,
    name: stores.name,
    slug: stores.slug,
    logo_url: stores.logo_url,
    website_url: stores.website_url,
    affiliate_url: stores.affiliate_url,
    category_slug: categories.slug
  })
  .from(stores)
  .leftJoin(categories, eq(stores.category_id, categories.id));

  log(`   Loaded ${dbStores.length} stores.`);

  const scrapedDeals: any[] = [];
  const errors: any[] = [];

  // 2. Scrape each store across the 4 targets
  for (const store of dbStores) {
    log(`\n👉 Processing store: ${store.name} (${store.slug})...`);
    const { cashkaro, grabon, coupondunia } = getUrlSlugs(store.slug);
    const category = normalizeCategory(store.category_slug);

    // -- Target 1: CouponDunia
    const cdUrl = `https://www.coupondunia.in/${coupondunia}`;
    log(`   Fetching CouponDunia: ${cdUrl}`);
    try {
      const html = await fetchPage(cdUrl);
      const cdDeals = parseCouponDunia(html, store.name, store.logo_url, category, cdUrl, coupondunia);
      log(`      Scraped ${cdDeals.length} deals.`);
      scrapedDeals.push(...cdDeals);
    } catch (err: any) {
      log(`      ❌ Error scraping CouponDunia: ${err.message || err}`);
      errors.push({
        site: 'coupondunia',
        url: cdUrl,
        reason: err.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
    await sleep(2000 + Math.random() * 2000); // 2-4s delay

    // -- Target 2: CashKaro
    const ckUrl = `https://cashkaro.com/stores/${cashkaro}`;
    log(`   Fetching CashKaro: ${ckUrl}`);
    try {
      const html = await fetchPage(ckUrl);
      const ckDeals = parseCashKaro(html, store.name, store.logo_url, category, ckUrl);
      log(`      Scraped ${ckDeals.length} deals.`);
      scrapedDeals.push(...ckDeals);
    } catch (err: any) {
      log(`      ❌ Error scraping CashKaro: ${err.message || err}`);
      errors.push({
        site: 'cashkaro',
        url: ckUrl,
        reason: err.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
    await sleep(2000 + Math.random() * 2000); // 2-4s delay

    // -- Target 3: GrabOn
    const goUrl = `https://grabon.in/${grabon}-coupons`;
    log(`   Fetching GrabOn: ${goUrl}`);
    try {
      const html = await fetchPage(goUrl);
      const goDeals = parseGrabOn(html, store.name, store.logo_url, category, goUrl, 'grabon');
      log(`      Scraped ${goDeals.length} deals.`);
      scrapedDeals.push(...goDeals);
    } catch (err: any) {
      log(`      ❌ Error scraping GrabOn: ${err.message || err}`);
      errors.push({
        site: 'grabon',
        url: goUrl,
        reason: err.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
    await sleep(2000 + Math.random() * 2000); // 2-4s delay

    // -- Target 4: GrabOn Coupons (Sub-domain, expected to fail resolving)
    const gocUrl = `https://coupons.grabon.in/${grabon}-coupons`;
    log(`   Fetching GrabOn Coupons: ${gocUrl}`);
    try {
      const html = await fetchPage(gocUrl);
      const gocDeals = parseGrabOn(html, store.name, store.logo_url, category, gocUrl, 'grabon_coupons');
      log(`      Scraped ${gocDeals.length} deals.`);
      scrapedDeals.push(...gocDeals);
    } catch (err: any) {
      log(`      ❌ Error scraping GrabOn Coupons: ${err.message || err}`);
      errors.push({
        site: 'grabon_coupons',
        url: gocUrl,
        reason: err.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
    await sleep(2000 + Math.random() * 2000); // 2-4s delay
  }

  // 3. Expiry Validation
  log('\n🛡️  Applying Expiry Validation Rules...');
  const validDeals: any[] = [];
  let expiredRemovedCount = 0;

  for (const deal of scrapedDeals) {
    const valResult = validateDeal(deal);
    if (valResult.valid) {
      validDeals.push(deal);
    } else {
      expiredRemovedCount++;
    }
  }
  log(`   Valid deals remaining: ${validDeals.length} (removed ${expiredRemovedCount} expired/invalid deals).`);

  // 4. Cross-Site Deduplication
  log('\n👥 Applying Deduplication Rules...');
  const { unique: deduplicatedDeals, removedCount: duplicatesRemovedCount } = deduplicateDeals(validDeals);
  log(`   Unique deals remaining: ${deduplicatedDeals.length} (removed ${duplicatesRemovedCount} duplicate deals).`);

  // 5. Build Output JSON Structure
  const outputJson = {
    run_timestamp: new Date().toISOString(),
    total_scraped: scrapedDeals.length,
    total_valid: deduplicatedDeals.length,
    total_expired_removed: expiredRemovedCount,
    total_duplicates_removed: duplicatesRemovedCount,
    deals: deduplicatedDeals,
    errors: errors
  };

  log(`\n💾 Writing feed to ${outputFilePath}...`);
  fs.writeFileSync(outputFilePath, JSON.stringify(outputJson, null, 2), 'utf8');
  log('   Output JSON successfully written.');

  // 6. DB Ingestion (Upsert Deals into Database)
  log('\n📦 Ingesting deals into database...');
  
  // Pre-ingestion cleanup: Mark all existing public scraped coupons as expired, and delete those with no clicks/reports/saves.
  try {
    log('   Cleaning up old public scraped coupons...');
    const expireResult = await db.execute(sql`
      UPDATE coupons
      SET expires_at = NOW() - INTERVAL '1 second', updated_at = NOW()
      WHERE source IN ('grabon', 'cashkaro', 'coupondunia', 'grabon_coupons')
        AND (expires_at IS NULL OR expires_at >= NOW())
    `);
    const expiredCount = expireResult.rowCount || 0;
    log(`      Marked ${expiredCount} active public coupons as expired.`);

    const cleanupResult = await db.execute(sql`
      DELETE FROM coupons
      WHERE source IN ('grabon', 'cashkaro', 'coupondunia', 'grabon_coupons')
        AND id NOT IN (SELECT DISTINCT coupon_id FROM coupon_clicks)
        AND id NOT IN (SELECT DISTINCT coupon_id FROM coupon_reports)
        AND id NOT IN (SELECT DISTINCT coupon_id FROM saved_coupons)
    `);
    const cleanedCount = cleanupResult.rowCount || 0;
    log(`      Cleaned up ${cleanedCount} old public coupons (with no clicks/reports/saves) from DB.`);
  } catch (cleanupErr) {
    log(`   ⚠️ Cleanup before ingestion failed: ${cleanupErr}`);
  }

  let dbInsertedCount = 0;

  for (const deal of deduplicatedDeals) {
    const dbStore = dbStores.find(s => s.name.toLowerCase() === deal.store_name.toLowerCase());
    if (!dbStore) continue;

    const expiresAt = deal.expiry_date ? new Date(deal.expiry_date) : null;

    try {
      await db.insert(coupons).values({
        store_id: dbStore.id,
        title: deal.title,
        description: deal.description,
        code: deal.code,
        coupon_type: deal.code ? 'code' : 'deal',
        discount_value: deal.discount,
        affiliate_url: dbStore.affiliate_url || dbStore.website_url || 'https://www.google.com',
        source: deal.source_site,
        is_verified: deal.is_verified,
        is_featured: deal.is_verified, // Promoted verified coupons to featured for homepage exposure
        expires_at: expiresAt,
      }).onConflictDoUpdate({
        target: [coupons.store_id, coupons.title],
        set: {
          code: sql`EXCLUDED.code`,
          coupon_type: sql`EXCLUDED.coupon_type`,
          discount_value: sql`EXCLUDED.discount_value`,
          affiliate_url: sql`EXCLUDED.affiliate_url`,
          expires_at: sql`EXCLUDED.expires_at`,
          is_verified: sql`EXCLUDED.is_verified`,
          is_featured: sql`EXCLUDED.is_featured`,
          updated_at: sql`NOW()`,
        }
      });
      dbInsertedCount++;
    } catch (err) {
      log(`   ❌ Error upserting coupon "${deal.title}" into DB: ${err}`);
    }
  }

  log(`   Database ingestion finished: upserted ${dbInsertedCount} coupons.`);

  // Ensure every store has at least one active coupon
  try {
    log('   Ensuring every store has at least one active coupon...');
    await ensureDefaultCoupons(db);
  } catch (err) {
    log(`   ⚠️ Failed to ensure default coupons: ${err}`);
  }

  // Run automatic verification job on all active coupons to prune bad links and content quality issues
  try {
    log('   Running automatic coupon verification...');
    await runAutomaticVerification(db);
  } catch (err) {
    log(`   ⚠️ Automatic verification failed: ${err}`);
  }
  
  log('\n═══════════════════════════════════════════════════════');
  log('  Scraping Pipeline Summary:');
  log(`  Total Scraped: ${scrapedDeals.length}`);
  log(`  Total Valid/Deduplicated: ${deduplicatedDeals.length}`);
  log(`  Expired Removed: ${expiredRemovedCount}`);
  log(`  Duplicates Removed: ${duplicatesRemovedCount}`);
  log(`  Errors Logged: ${errors.length}`);
  log(`  Completed at: ${new Date().toISOString()}`);
  log('═══════════════════════════════════════════════════════');
}

main().catch((error) => {
  console.error('Fatal error in scraping pipeline:', error);
  process.exit(1);
});
