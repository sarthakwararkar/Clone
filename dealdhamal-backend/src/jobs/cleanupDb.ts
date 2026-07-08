import { sql } from 'drizzle-orm';
import { createDb } from '../db';
import { stores, coupons } from '../db/schema';
import { ensureDefaultCoupons } from './ensureCoupons';

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DealDhamal — Database Cleanup and Initialization Script');
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const db = createDb(process.env.DATABASE_URL);

  // 1. Clean existing filler/boilerplate coupons
  console.log('\n🧹 Deleting filler/boilerplate coupons...');
  try {
    const deleteResult = await db.execute(sql`
      DELETE FROM coupons 
      WHERE LOWER(title) IN ('get deal', 'get code', 'grab deal', 'click here', 'shop now', 'signup now & visit the page best features')
         OR LOWER(description) LIKE '%signup now & visit the page%'
    `);
    console.log(`   ✓ Deleted ${deleteResult.rowCount || 0} filler coupons from DB.`);
  } catch (err) {
    console.error('   ❌ Failed to delete filler coupons:', err);
  }

  // 2. Update store banner URLs currently using Google image search redirects
  console.log('\n🏪 Updating store banners...');
  const bannersToUpdate = [
    { slug: 'boat', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80' },
    { slug: 'campus', url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80' },
    { slug: 'croma', url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1200&q=80' },
    { slug: 'crocs', url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80' },
    { slug: 'bella-vita', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
    { slug: 'bewakoof', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80' },
  ];

  for (const { slug, url } of bannersToUpdate) {
    try {
      const updateResult = await db.update(stores)
        .set({ banner_url: url })
        .where(sql`slug = ${slug}`)
        .returning();
      
      if (updateResult.length > 0) {
        console.log(`   ✓ Updated banner for "${slug}"`);
      } else {
        console.warn(`   ⚠️ Store "${slug}" not found, skipping banner update.`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to update banner for "${slug}":`, err);
    }
  }

  // 3. Dynamically populate default coupons for any store with 0 active coupons
  console.log('\n🛡️ Generating fallback coupons for empty stores...');
  try {
    await ensureDefaultCoupons(db);
  } catch (err) {
    console.error('   ❌ Failed to generate fallback coupons:', err);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Database Cleanup Job Complete.');
  console.log(`  Completed at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error in cleanupDb script:', err);
  process.exit(1);
});
