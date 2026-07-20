import { sql } from 'drizzle-orm';
import { createDb } from '../db';
import { stores, coupons } from '../db/schema';

export async function ensureDefaultCoupons(db: any) {
  console.log('🔍 Checking for stores with 0 active coupons...');

  const allStores = await db.select({
    id: stores.id,
    name: stores.name,
    slug: stores.slug,
  }).from(stores);

  let emptyStoreCount = 0;

  for (const store of allStores) {
    const activeResult = await db.execute(sql`
      SELECT COUNT(*)::int AS count FROM coupons 
      WHERE store_id = ${store.id} 
        AND (expires_at > NOW() OR expires_at IS NULL)
    `);
    const activeCount = (activeResult.rows[0] as any)?.count || 0;

    if (activeCount === 0) {
      emptyStoreCount++;
      // Log only — do NOT inject fake coupons.
      // Stores with no affiliate deals will show an honest empty state.
      // Real coupons will appear after the next affiliate sync run.
      console.log(`   ⚠️  Store "${store.name}" (${store.slug}) has 0 active coupons.`);
    }
  }

  if (emptyStoreCount > 0) {
    console.log(`   ${emptyStoreCount} stores currently have no active affiliate coupons. They will be populated on the next sync.`);
  } else {
    console.log('   ✅ All stores have at least one active coupon.');
  }
}async function main() {
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
