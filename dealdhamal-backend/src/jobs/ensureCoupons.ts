import { sql } from 'drizzle-orm';
import { createDb } from '../db';
import { stores, coupons } from '../db/schema';

export async function ensureDefaultCoupons(db: any) {
  console.log('🔍 Checking for stores with 0 active coupons...');
  
  const allStores = await db.select({
    id: stores.id,
    name: stores.name,
    slug: stores.slug,
    website_url: stores.website_url,
    affiliate_url: stores.affiliate_url,
  }).from(stores);
  
  const getFallbackCoupons = (storeName: string, storeSlug: string) => {
    const name = storeName;
    const slug = storeSlug.toLowerCase().trim();
    
    if (slug === 'beautiful-ai') {
      return [
        { title: `Get 14-Day Free Trial on ${name} Pro`, type: 'deal', discount_value: 'Free Trial' },
        { title: `Save 20% on ${name} Annual Presentation Plans`, type: 'deal', discount_value: '20% Off' }
      ];
    }
    if (slug === 'adcreative-ai') {
      return [
        { title: `Get 10 Free Ad Credits on ${name} Sign Up`, type: 'deal', discount_value: 'Free Credits' },
        { title: `Flat 25% Off on ${name} Starter Plan`, type: 'code', code: 'CREATIVE25', discount_value: '25% Off' }
      ];
    }
    if (slug === 'campus') {
      return [
        { title: `Flat 10% Off on All ${name} Shoes & Sneakers`, type: 'code', code: 'CAMPUS10', discount_value: '10% Off' },
        { title: `Up to 50% Off on ${name} Best Selling Footwear`, type: 'deal', discount_value: '50% Off' }
      ];
    }
    if (slug === 'midjourney') {
      return [
        { title: `Start Generating AI Images with ${name} on Discord`, type: 'deal', discount_value: 'Free Trial' }
      ];
    }
    if (slug === 'openai-chatgpt' || slug.includes('openai') || slug.includes('chatgpt')) {
      return [
        { title: `Access ChatGPT 4o Mini for Free`, type: 'deal', discount_value: 'Free Access' },
        { title: `Get ChatGPT Plus Subscription for $20/month`, type: 'deal', discount_value: '$20/mo' }
      ];
    }
    if (slug === 'browse-ai') {
      return [
        { title: `Get 50 Free Web Scraping Credits on Sign Up`, type: 'deal', discount_value: '50 Credits' }
      ];
    }
    if (slug === 'jasper-ai') {
      return [
        { title: `Start ${name} 7-Day Free Trial`, type: 'deal', discount_value: 'Free Trial' }
      ];
    }
    if (slug === 'copy-ai') {
      return [
        { title: `Free Forever Plan: 2,000 Words Per Month`, type: 'deal', discount_value: 'Free Plan' }
      ];
    }
    
    // Generic fallback for any other store
    return [
      { title: `Check Latest Offers & Product Deals at ${name}`, type: 'deal', discount_value: 'Active Deal' },
      { title: `Up to 45% Off on Selected ${name} Products`, type: 'deal', discount_value: '45% Off' }
    ];
  };

  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days from now
  let populatedCount = 0;

  for (const store of allStores) {
    const activeResult = await db.execute(sql`
      SELECT COUNT(*)::int AS count FROM coupons 
      WHERE store_id = ${store.id} 
        AND (expires_at > NOW() OR expires_at IS NULL)
    `);
    const activeCount = (activeResult.rows[0] as any)?.count || 0;
    
    if (activeCount === 0) {
      console.log(`🏪 Store "${store.name}" (${store.slug}) has 0 active coupons. Generating fallback deals...`);
      const defaultCoupons = getFallbackCoupons(store.name, store.slug);
      
      for (const cp of defaultCoupons) {
        try {
          await db.insert(coupons).values({
            store_id: store.id,
            title: cp.title,
            code: (cp as any).code || null,
            coupon_type: cp.type as 'code' | 'deal' | 'cashback',
            discount_value: cp.discount_value,
            affiliate_url: store.affiliate_url || store.website_url || 'https://www.google.com',
            source: 'manual',
            is_verified: false,
            is_featured: false,
            expires_at: expiresAt,
          }).onConflictDoNothing();
          populatedCount++;
          console.log(`   ✓ Added: "${cp.title}"`);
        } catch (err) {
          console.error(`   ❌ Failed to insert fallback coupon for ${store.name}:`, err);
        }
      }
    }
  }
  
  console.log(`✨ Finished checking. Dynamically generated ${populatedCount} active coupons.`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }
  const db = createDb(process.env.DATABASE_URL);
  await ensureDefaultCoupons(db);
}

// Check if running directly
const isMain = process.argv[1] && (
  process.argv[1].endsWith('ensureCoupons.ts') || 
  process.argv[1].endsWith('ensureCoupons.js') ||
  process.argv[1].endsWith('cleanupDb.ts')
);

if (isMain && !process.argv[1].endsWith('cleanupDb.ts')) {
  main().catch(err => {
    console.error('Fatal error in ensureCoupons job:', err);
    process.exit(1);
  });
}
