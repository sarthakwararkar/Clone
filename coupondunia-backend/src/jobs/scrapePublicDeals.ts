import * as cheerio from 'cheerio';
import { sql, eq } from 'drizzle-orm';
import { createDb } from '../db';
import { stores, coupons } from '../db/schema';

// ─── Constants & Configuration ──────────────────────────────────────────────

const TARGET_STORES = [
  { dbSlug: 'myntra', urlSlug: 'myntra' },
  { dbSlug: 'flipkart', urlSlug: 'flipkart' },
  { dbSlug: 'amazon-india', urlSlug: 'amazon' },
  { dbSlug: 'swiggy', urlSlug: 'swiggy' },
  { dbSlug: 'zomato', urlSlug: 'zomato' },
  { dbSlug: 'nykaa', urlSlug: 'nykaa' },
  { dbSlug: 'ajio', urlSlug: 'ajio' },
  { dbSlug: 'makemytrip', urlSlug: 'makemytrip' },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function cleanText(str: string): string {
  return str ? str.trim().replace(/\s+/g, ' ') : '';
}

export function detectCouponType(code: string | null): 'code' | 'deal' {
  return code && code.length > 0 ? 'code' : 'deal';
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false; // Assume active if null
  try {
    const parsedDate = new Date(dateStr);
    return parsedDate.getTime() < Date.now();
  } catch {
    return false;
  }
}

// Fetch with a simple 1-retry mechanism for robustness
async function fetchPage(url: string, retries = 1): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (response.status === 404) {
      console.warn(`   ⚠️ 404 Not Found: ${url}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    if (retries > 0) {
      console.warn(`   ⚠️ Fetch failed for ${url}, retrying in 2 seconds... Error: ${error}`);
      await sleep(2000);
      return fetchPage(url, retries - 1);
    }
    console.error(`   ❌ Failed to fetch ${url} after retries. Error:`, error);
    return null;
  }
}

// ─── Selector Parsing Logic ──────────────────────────────────────────────────

/**
 * Parses GrabOn coupon listing pages.
 * targets:
 * - Card elements: '.gc-card' or 'li.gc-card' (each card represents one deal)
 * - Coupon Title: '.gc-title' or '.go-coupon-title' or 'h3'
 * - Coupon Code: '.gc-code' or 'span.code' (button that reveals the code)
 * - Discount Text: '.gc-disc' or '.coupon-discount'
 */
function parseGrabOn(html: string): Array<{ title: string; code: string | null; discount: string }> {
  const $ = cheerio.load(html);
  const items: Array<{ title: string; code: string | null; discount: string }> = [];

  $('.gc-card, li.gc-card, .coupon-card').each((_, el) => {
    const title = cleanText($(el).find('.gc-title, .coupon-title, h3, .go-coupon-title').first().text());
    let codeText = cleanText($(el).find('.gc-code, .coupon-code, span.code, .cpn-btn, [data-code]').first().text() || $(el).attr('data-code') || '');
    const discount = cleanText($(el).find('.gc-disc, .coupon-discount, .discount-text').first().text());

    // Filter out mock code placeholders like "Show Code", "Reveal", "Activate"
    const isMockCode = /show|reveal|activate|click|deal|get/i.test(codeText);
    const code = codeText && !isMockCode ? codeText : null;

    if (title) {
      items.push({ title, code, discount: discount || 'Get Offer' });
    }
  });

  return items;
}

/**
 * Parses CashKaro store pages.
 * targets:
 * - Card elements: '.ck-card' or '.coupon-box' or '.card-container'
 * - Title: '.ck-title' or 'h3' or '.coupon-title'
 * - Code: '.ck-code' or '.coupon-code' or 'span.code'
 * - Discount: '.ck-discount' or '.discount'
 */
function parseCashKaro(html: string): Array<{ title: string; code: string | null; discount: string }> {
  const $ = cheerio.load(html);
  const items: Array<{ title: string; code: string | null; discount: string }> = [];

  $('.ck-card, .coupon-box, .card-container, div[data-coupon-id]').each((_, el) => {
    const title = cleanText($(el).find('h3, .ck-title, .coupon-title, .coupon-name, .offer-title').first().text());
    let codeText = cleanText($(el).find('.ck-code, .coupon-code, .promo-code, span.code, [data-code]').first().text() || $(el).attr('data-code') || '');
    const discount = cleanText($(el).find('.ck-discount, .discount, .coupon-discount, .cashback-rate').first().text());

    const isMockCode = /show|reveal|activate|click|deal|get/i.test(codeText);
    const code = codeText && !isMockCode ? codeText : null;

    if (title) {
      items.push({ title, code, discount: discount || 'Get Cashback' });
    }
  });

  return items;
}

/**
 * Parses Desidime store pages.
 * targets:
 * - Card elements: '.deal-box' or '.deal-card' or '.d-card'
 * - Title: '.deal-title' or 'h3' or '.coupon-title' or '.deal-heading'
 * - Code: '.deal-code' or '.coupon-code' or '.promo-code'
 * - Discount: '.deal-discount' or '.discount'
 */
function parseDesidime(html: string): Array<{ title: string; code: string | null; discount: string }> {
  const $ = cheerio.load(html);
  const items: Array<{ title: string; code: string | null; discount: string }> = [];

  $('.deal-box, .deal-card, .d-card, .coupon-box').each((_, el) => {
    const title = cleanText($(el).find('h3, .deal-title, .coupon-title, .deal-heading, .title').first().text());
    let codeText = cleanText($(el).find('.deal-code, .coupon-code, .promo-code, span.code').first().text() || $(el).attr('data-code') || '');
    const discount = cleanText($(el).find('.deal-discount, .discount, .coupon-discount, .deal-price').first().text());

    const isMockCode = /show|reveal|activate|click|deal|get/i.test(codeText);
    const code = codeText && !isMockCode ? codeText : null;

    if (title) {
      items.push({ title, code, discount: discount || 'Get Deal' });
    }
  });

  return items;
}

// ─── Main Execution Scraper ──────────────────────────────────────────────────

export async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CouponDunia — Public Deals Scraper Job');
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const db = createDb(process.env.DATABASE_URL);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

  const counts = {
    grabon: 0,
    cashkaro: 0,
    desidime: 0,
  };

  // 1. GrabOn Scraper
  console.log('\n🌐 Scraping GrabOn...');
  for (const store of TARGET_STORES) {
    console.log(`   Scraping GrabOn for: ${store.dbSlug}...`);
    const url = `https://grabon.in/${store.urlSlug}-coupons`;
    const html = await fetchPage(url);
    if (!html) continue;

    const parsedCoupons = parseGrabOn(html);
    if (parsedCoupons.length === 0) {
      console.log(`      No coupons found on page.`);
      continue;
    }

    const [dbStore] = await db.select().from(stores).where(eq(stores.slug, store.dbSlug)).limit(1);
    if (!dbStore) {
      console.warn(`      ⚠️ Store "${store.dbSlug}" not found in database. Skipping coupons.`);
      continue;
    }

    let scrapedCount = 0;
    for (const cp of parsedCoupons) {
      try {
        await db.insert(coupons).values({
          store_id: dbStore.id,
          title: cp.title,
          code: cp.code,
          coupon_type: detectCouponType(cp.code),
          discount_value: cp.discount,
          affiliate_url: dbStore.affiliate_url || dbStore.website_url || 'https://www.google.com',
          source: 'grabon',
          expires_at: expiresAt,
        }).onConflictDoUpdate({
          target: [coupons.store_id, coupons.title],
          set: {
            code: sql`EXCLUDED.code`,
            coupon_type: sql`EXCLUDED.coupon_type`,
            discount_value: sql`EXCLUDED.discount_value`,
            affiliate_url: sql`EXCLUDED.affiliate_url`,
            expires_at: sql`EXCLUDED.expires_at`,
            updated_at: sql`NOW()`,
          }
        });
        scrapedCount++;
        counts.grabon++;
      } catch (err) {
        console.error(`      ❌ Error upserting coupon "${cp.title}":`, err);
      }
    }
    console.log(`      ✅ Scraped ${scrapedCount} coupons from GrabOn for ${store.dbSlug}`);
    await sleep(1000); // 1s delay to avoid block
  }

  // 2. CashKaro Scraper
  console.log('\n🌐 Scraping CashKaro...');
  for (const store of TARGET_STORES) {
    console.log(`   Scraping CashKaro for: ${store.dbSlug}...`);
    const url = `https://cashkaro.com/stores/${store.urlSlug}-coupons`;
    const html = await fetchPage(url);
    if (!html) continue;

    const parsedCoupons = parseCashKaro(html);
    if (parsedCoupons.length === 0) {
      console.log(`      No coupons found on page.`);
      continue;
    }

    const [dbStore] = await db.select().from(stores).where(eq(stores.slug, store.dbSlug)).limit(1);
    if (!dbStore) {
      console.warn(`      ⚠️ Store "${store.dbSlug}" not found in database. Skipping coupons.`);
      continue;
    }

    let scrapedCount = 0;
    for (const cp of parsedCoupons) {
      try {
        await db.insert(coupons).values({
          store_id: dbStore.id,
          title: cp.title,
          code: cp.code,
          coupon_type: detectCouponType(cp.code),
          discount_value: cp.discount,
          affiliate_url: dbStore.affiliate_url || dbStore.website_url || 'https://www.google.com',
          source: 'cashkaro',
          expires_at: expiresAt,
        }).onConflictDoUpdate({
          target: [coupons.store_id, coupons.title],
          set: {
            code: sql`EXCLUDED.code`,
            coupon_type: sql`EXCLUDED.coupon_type`,
            discount_value: sql`EXCLUDED.discount_value`,
            affiliate_url: sql`EXCLUDED.affiliate_url`,
            expires_at: sql`EXCLUDED.expires_at`,
            updated_at: sql`NOW()`,
          }
        });
        scrapedCount++;
        counts.cashkaro++;
      } catch (err) {
        console.error(`      ❌ Error upserting coupon "${cp.title}":`, err);
      }
    }
    console.log(`      ✅ Scraped ${scrapedCount} coupons from CashKaro for ${store.dbSlug}`);
    await sleep(1000); // 1s delay
  }

  // 3. Desidime Scraper
  console.log('\n🌐 Scraping Desidime...');
  for (const store of TARGET_STORES) {
    console.log(`   Scraping Desidime for: ${store.dbSlug}...`);
    const url = `https://www.desidime.com/stores/${store.urlSlug}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const parsedCoupons = parseDesidime(html);
    if (parsedCoupons.length === 0) {
      console.log(`      No coupons found on page.`);
      continue;
    }

    const [dbStore] = await db.select().from(stores).where(eq(stores.slug, store.dbSlug)).limit(1);
    if (!dbStore) {
      console.warn(`      ⚠️ Store "${store.dbSlug}" not found in database. Skipping coupons.`);
      continue;
    }

    let scrapedCount = 0;
    for (const cp of parsedCoupons) {
      try {
        await db.insert(coupons).values({
          store_id: dbStore.id,
          title: cp.title,
          code: cp.code,
          coupon_type: detectCouponType(cp.code),
          discount_value: cp.discount,
          affiliate_url: dbStore.affiliate_url || dbStore.website_url || 'https://www.google.com',
          source: 'desidime',
          expires_at: expiresAt,
        }).onConflictDoUpdate({
          target: [coupons.store_id, coupons.title],
          set: {
            code: sql`EXCLUDED.code`,
            coupon_type: sql`EXCLUDED.coupon_type`,
            discount_value: sql`EXCLUDED.discount_value`,
            affiliate_url: sql`EXCLUDED.affiliate_url`,
            expires_at: sql`EXCLUDED.expires_at`,
            updated_at: sql`NOW()`,
          }
        });
        scrapedCount++;
        counts.desidime++;
      } catch (err) {
        console.error(`      ❌ Error upserting coupon "${cp.title}":`, err);
      }
    }
    console.log(`      ✅ Scraped ${scrapedCount} coupons from Desidime for ${store.dbSlug}`);
    await sleep(1000); // 1s delay
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Scraping Summary:');
  console.log(`  GrabOn: ${counts.grabon} coupons`);
  console.log(`  CashKaro: ${counts.cashkaro} coupons`);
  console.log(`  Desidime: ${counts.desidime} coupons`);
  console.log(`  Completed at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error in scraping job:', error);
    process.exit(1);
  });
}
