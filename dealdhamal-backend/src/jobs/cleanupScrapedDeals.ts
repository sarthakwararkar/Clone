/**
 * One-time cleanup: Remove all publicly-scraped coupons from the database.
 *
 * Removes coupons sourced from: grabon, cashkaro, coupondunia, grabon_coupons
 * Also removes their associated clicks, reports, and saved records.
 *
 * Usage: npx tsx src/jobs/cleanupScrapedDeals.ts
 */

import { sql } from 'drizzle-orm';
import { createDb } from '../db';

const SCRAPED_SOURCES = ["grabon", "cashkaro", "coupondunia", "grabon_coupons"];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const db = createDb(process.env.DATABASE_URL!);

  console.log("-------------------------------------------------------");
  console.log("  Cleanup: Removing publicly-scraped coupons from DB");
  console.log(`  Sources: ${SCRAPED_SOURCES.join(", ")}`);
  console.log("-------------------------------------------------------");

  const sourceList = SCRAPED_SOURCES.map(s => `'${s}'`).join(", ");

  // 1. Remove orphaned clicks
  const clicksResult = await db.execute(
    sql.raw(`DELETE FROM coupon_clicks WHERE coupon_id IN (SELECT id FROM coupons WHERE source IN (${sourceList}))`)
  );
  console.log(`? Removed ${(clicksResult as any).rowCount ?? 0} click records`);

  // 2. Remove orphaned reports
  const reportsResult = await db.execute(
    sql.raw(`DELETE FROM coupon_reports WHERE coupon_id IN (SELECT id FROM coupons WHERE source IN (${sourceList}))`)
  );
  console.log(`? Removed ${(reportsResult as any).rowCount ?? 0} report records`);

  // 3. Remove orphaned saved_coupons
  const savedResult = await db.execute(
    sql.raw(`DELETE FROM saved_coupons WHERE coupon_id IN (SELECT id FROM coupons WHERE source IN (${sourceList}))`)
  );
  console.log(`? Removed ${(savedResult as any).rowCount ?? 0} saved records`);

  // 4. Remove the coupons themselves
  const couponsResult = await db.execute(
    sql.raw(`DELETE FROM coupons WHERE source IN (${sourceList})`)
  );
  console.log(`? Removed ${(couponsResult as any).rowCount ?? 0} scraped coupons`);

  console.log("\n  Done. All publicly-scraped coupon data has been removed.");
  console.log("-------------------------------------------------------");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
