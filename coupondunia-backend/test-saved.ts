import { createDb } from './src/db';
import { users, coupons, savedCoupons } from './src/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Load DATABASE_URL from root .env
let databaseUrl = '';
const envPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key === 'DATABASE_URL') {
        databaseUrl = val;
      }
    }
  });
}

if (!databaseUrl) {
  console.error('❌ Could not find DATABASE_URL in root .env file.');
  process.exit(1);
}

async function main() {
  const db = createDb(databaseUrl);
  
  console.log('Querying users...');
  const allUsers = await db.select().from(users).limit(5);
  console.log('Users:', allUsers);

  console.log('Querying coupons...');
  const allCoupons = await db.select().from(coupons).limit(5);
  console.log('Coupons:', allCoupons);

  console.log('Querying saved_coupons...');
  const saved = await db.select().from(savedCoupons).limit(5);
  console.log('Saved Coupons:', saved);

  if (allUsers.length > 0 && allCoupons.length > 0) {
    const userId = allUsers[0].id;
    const couponId = allCoupons[0].id;
    console.log(`Testing insert for user ${userId} and coupon ${couponId}...`);
    try {
      const [insertRes] = await db.insert(savedCoupons).values({
        user_id: userId,
        coupon_id: couponId,
      }).returning();
      console.log('Insert success:', insertRes);
      
      // clean up
      await db.delete(savedCoupons).where(
        eq(savedCoupons.user_id, userId)
      );
      console.log('Cleaned up test insert.');
    } catch (err) {
      console.error('Insert failed:', err);
    }
  }
}

main().catch(console.error);
